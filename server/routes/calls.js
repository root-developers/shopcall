const router = require('express').Router();
const Call = require('../models/Call');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all calls for store owner
router.get('/', auth, async (req, res) => {
  try {
    const calls = await Call.find({ storeId: req.user.id }).sort({ startedAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const storeId = req.user.id;
    const mongoose = require('mongoose');
    const [connected, missed, scheduled, total, totalDuration] = await Promise.all([
      Call.countDocuments({ storeId, status: 'connected' }),
      Call.countDocuments({ storeId, status: 'missed' }),
      Call.countDocuments({ storeId, status: 'scheduled' }),
      Call.countDocuments({ storeId }),
      Call.aggregate([
        { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]),
    ]);
    const user = await User.findById(storeId);
    const usedCalls = await Call.countDocuments({ storeId, status: { $in: ['pending', 'connected', 'missed', 'rejected'] } });
    res.json({
      connected, missed, scheduled, total,
      totalMinutes: Math.round((totalDuration[0]?.total || 0) / 60),
      trialCustomersUsed: usedCalls,
      trialLimit: user.trialLimit,
      plan: user.plan,
      billingCycleEnd: user.billingCycleEnd,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get pending/incoming calls (for agent dashboard)
router.get('/incoming', auth, async (req, res) => {
  try {
    const calls = await Call.find({
      storeId: req.user.id,
      status: 'pending',
      startedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    }).sort({ startedAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incoming calls' });
  }
});

module.exports = router;
