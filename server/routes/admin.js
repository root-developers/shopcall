const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Call = require('../models/Call');
const Agent = require('../models/Agent');
const Billing = require('../models/Billing');

// Middleware for admin auth
function adminAuth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'superadmin') return res.status(403).json({ error: 'Not admin' });
    req.admin = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// Create first admin (run once)
router.post('/setup', async (req, res) => {
  const count = await Admin.countDocuments();
  if (count > 0) return res.status(400).json({ error: 'Admin already exists' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hashed });
  res.json({ success: true });
});

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.password))) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Get all stores with usage
router.get('/stores', adminAuth, async (req, res) => {
  const stores = await User.find().select('-password').lean();
  const storeData = await Promise.all(stores.map(async (store) => {
    const [totalCalls, connectedCalls, missedCalls, agentCount, totalDuration] = await Promise.all([
      Call.countDocuments({ storeId: store._id }),
      Call.countDocuments({ storeId: store._id, status: 'connected' }),
      Call.countDocuments({ storeId: store._id, status: 'missed' }),
      Agent.countDocuments({ storeId: store._id }),
      Call.aggregate([
        { $match: { storeId: store._id } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]),
    ]);
    // Actual usage = all non-cancelled calls (matches what store owner sees)
    const usedCalls = await Call.countDocuments({ storeId: store._id, status: { $in: ['pending', 'connected', 'missed', 'rejected'] } });
    return { ...store, totalCalls, connectedCalls, missedCalls, agentCount, totalMinutes: Math.round((totalDuration[0]?.total || 0) / 60), trialCustomersUsed: usedCalls };
  }));
  res.json(storeData);
});

// Platform-wide stats
router.get('/stats', adminAuth, async (req, res) => {
  const [totalStores, totalAgents, totalCalls, connectedCalls, missedCalls, rejectedCalls] = await Promise.all([
    User.countDocuments(),
    Agent.countDocuments(),
    Call.countDocuments(),
    Call.countDocuments({ status: 'connected' }),
    Call.countDocuments({ status: 'missed' }),
    Call.countDocuments({ status: 'rejected' }),
  ]);
  const totalDuration = await Call.aggregate([{ $group: { _id: null, total: { $sum: '$duration' } } }]);
  const recentStores = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
  res.json({ totalStores, totalAgents, totalCalls, connectedCalls, missedCalls, rejectedCalls, totalMinutes: Math.round((totalDuration[0]?.total || 0) / 60), recentStores });
});

// Update store plan/limits
router.patch('/stores/:id', adminAuth, async (req, res) => {
  const { plan, trialLimit } = req.body;
  const update = {};
  if (plan) update.plan = plan;
  if (trialLimit) update.trialLimit = trialLimit;
  const PLAN_LIMITS = { trial: 5, starter: 200, pro: 99999 };
  if (plan && PLAN_LIMITS[plan]) update.trialLimit = PLAN_LIMITS[plan];
  await User.findByIdAndUpdate(req.params.id, update);
  res.json({ success: true });
});

// Get all pending billing requests
router.get('/billing', adminAuth, async (req, res) => {
  const bills = await Billing.find().sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all(bills.map(async (b) => {
    const store = await User.findById(b.storeId).select('storeName email');
    return { ...b, storeName: store?.storeName, storeEmail: store?.email };
  }));
  res.json(enriched);
});

// Approve payment — activate plan
router.post('/billing/:id/approve', adminAuth, async (req, res) => {
  const billing = await Billing.findById(req.params.id);
  if (!billing) return res.status(404).json({ error: 'Not found' });
  billing.status = 'paid';
  billing.method = 'admin';
  await billing.save();
  const PLAN_LIMITS = { trial: 5, starter: 200, pro: 99999 };
  const now = new Date();
  const cycleEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  await User.findByIdAndUpdate(billing.storeId, { plan: billing.plan, trialLimit: PLAN_LIMITS[billing.plan] || 5, trialCustomersUsed: 0, planActivatedAt: now, billingCycleEnd: cycleEnd });
  // Notify store owner
  try {
    const notify = req.app.get('notify');
    const io = req.app.get('io');
    if (notify && io) {
      const store = await User.findById(billing.storeId);
      notify.send(io, billing.storeId.toString(), 'upgrade_approved', 'Plan Upgraded! 🎉', `Your plan has been upgraded to ${billing.plan}. Enjoy!`);
    }
  } catch(e) {}
  res.json({ success: true });
});

// Reject payment
router.post('/billing/:id/reject', adminAuth, async (req, res) => {
  const billing = await Billing.findById(req.params.id);
  if (!billing) return res.status(404).json({ error: 'Not found' });
  billing.status = 'failed';
  billing.note = (billing.note || '') + ' | Rejected by admin';
  await billing.save();
  // Notify store owner
  try {
    const notify = req.app.get('notify');
    const io = req.app.get('io');
    if (notify && io) notify.send(io, billing.storeId.toString(), 'upgrade_rejected', 'Upgrade Request Rejected', `Your upgrade to ${billing.plan} was not approved. Contact support.`);
  } catch(e) {}
  res.json({ success: true });
});

module.exports = router;
