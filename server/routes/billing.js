const router = require('express').Router();
const User = require('../models/User');
const Billing = require('../models/Billing');
const auth = require('../middleware/auth');

const PLANS = {
  trial: { price: 0, calls: 5, agents: 1 },
  starter: { price: 999, calls: 200, agents: 3 },
  pro: { price: 2999, calls: 99999, agents: 10 },
};

// Get current plan info
router.get('/plan', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('plan trialLimit trialCustomersUsed');
  res.json({ ...PLANS[user.plan], currentPlan: user.plan, used: user.trialCustomersUsed, limit: user.trialLimit });
});

// Get all plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// Request plan upgrade (store owner)
router.post('/upgrade', auth, async (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });
  const user = await User.findById(req.user.id);
  if (user.plan === plan) return res.status(400).json({ error: 'Already on this plan' });

  // Cancel any existing pending request (soft delete)
  await Billing.updateMany(
    { storeId: user._id, status: 'pending' },
    { status: 'cancelled', note: 'Replaced by new upgrade request' }
  );

  const billing = await Billing.create({
    storeId: user._id,
    plan,
    amount: PLANS[plan].price,
    status: plan === 'trial' ? 'paid' : 'pending',
    method: 'manual',
    note: `Upgrade from ${user.plan} to ${plan}`,
  });

  if (plan === 'trial') {
    user.plan = plan;
    user.trialLimit = PLANS[plan].calls;
    await user.save();
  }

  res.json({ billingId: billing._id, amount: PLANS[plan].price, plan, status: billing.status });

  // Notify admins about upgrade request
  if (plan !== 'trial') {
    try {
      const notify = req.app.get('notify');
      const io = req.app.get('io');
      if (notify && io) notify.sendToAdmins(io, 'upgrade_request', 'New Upgrade Request', `${user.storeName} wants to upgrade to ${plan} (₹${PLANS[plan].price})`);
    } catch(e) {}
  }
});

// Cancel pending upgrade request
router.post('/cancel', auth, async (req, res) => {
  const result = await Billing.updateMany(
    { storeId: req.user.id, status: 'pending' },
    { status: 'cancelled', note: 'Cancelled by user' }
  );
  res.json({ success: true, cancelled: result.modifiedCount });
});

// Check if there's a pending request
router.get('/pending', auth, async (req, res) => {
  const pending = await Billing.findOne({ storeId: req.user.id, status: 'pending' });
  res.json({ pending: pending || null });
});

// Mark payment as paid (self-report — for manual bank transfer)
router.post('/confirm-payment', auth, async (req, res) => {
  const { billingId } = req.body;
  const billing = await Billing.findOne({ _id: billingId, storeId: req.user.id });
  if (!billing) return res.status(404).json({ error: 'Billing record not found' });
  if (billing.status === 'paid') return res.status(400).json({ error: 'Already paid' });

  // Mark as pending verification (admin will confirm)
  billing.note = (billing.note || '') + ' | Payment reported by user';
  await billing.save();
  res.json({ success: true, message: 'Payment reported. Admin will verify and activate your plan.' });
});

// Get billing history (store owner)
router.get('/history', auth, async (req, res) => {
  const bills = await Billing.find({ storeId: req.user.id }).sort({ createdAt: -1 });
  res.json(bills);
});

module.exports = router;
