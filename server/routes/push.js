const router = require('express').Router();
const webpush = require('web-push');
const PushSub = require('../models/PushSub');
const auth = require('../middleware/auth');

let vapidConfigured = false;
function ensureVapid() {
  if (!vapidConfigured && process.env.VAPID_PUBLIC_KEY) {
    webpush.setVapidDetails(process.env.VAPID_EMAIL, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    vapidConfigured = true;
  }
}

// Get VAPID public key
router.get('/vapid-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

// Subscribe to push notifications
router.post('/subscribe', auth, async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription required' });
  await PushSub.deleteMany({ userId: req.user.id });
  await PushSub.create({
    userId: req.user.id,
    storeId: req.user.storeId || req.user.id,
    role: req.user.storeId ? 'agent' : 'owner',
    subscription,
  });
  res.json({ success: true });
});

// Send push to available (non-busy) agents/owner of a store
router.sendPush = async function(storeId, payload) {
  ensureVapid();
  const subs = await PushSub.find({ storeId, busy: { $ne: true } });
  const promises = subs.map(sub =>
    webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(() => {
      PushSub.deleteOne({ _id: sub._id }).catch(() => {});
    })
  );
  await Promise.allSettled(promises);
};

module.exports = router;
