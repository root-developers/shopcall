const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Call = require('../models/Call');
const TestedLead = require('../models/TestedLead');
const auth = require('../middleware/auth');

// Token for server-side API calls (room creation) - needs version 2
function generateServerToken() {
  const payload = {
    apikey: process.env.VIDEOSDK_API_KEY,
    permissions: ['allow_join', 'allow_mod'],
    version: 2,
  };
  return jwt.sign(payload, process.env.VIDEOSDK_SECRET, { expiresIn: '24h', algorithm: 'HS256' });
}

// Token for client-side SDK (joining meetings) - no version field
function generateClientToken() {
  const payload = {
    apikey: process.env.VIDEOSDK_API_KEY,
    permissions: ['allow_join', 'allow_mod'],
  };
  return jwt.sign(payload, process.env.VIDEOSDK_SECRET, { expiresIn: '24h', algorithm: 'HS256' });
}

// Create meeting room
router.post('/create-meeting', auth, async (req, res) => {
  try {
    const response = await fetch(`${process.env.VIDEOSDK_API_ENDPOINT}/rooms`, {
      method: 'POST',
      headers: { Authorization: generateServerToken(), 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    res.json({ meetingId: data.roomId, token: generateClientToken() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shopper requests call — only creates DB record, no VideoSDK room yet
router.post('/join-meeting', async (req, res) => {
  try {
    const { sdkKey, shopperName, shopperPhone } = req.body;
    const store = await User.findOne({ sdkKey });
    if (!store) return res.status(404).json({ error: 'Invalid SDK key' });

    if (store.plan === 'trial' && store.trialCustomersUsed >= store.trialLimit) {
      // Notify store owner that a customer tried to connect
      const push = require('./push');
      const notify = req.app.get('notify');
      const io = req.app.get('io');
      const customerInfo = shopperName || 'A customer';
      const phoneInfo = shopperPhone ? ` (${shopperPhone})` : '';

      // Push notification
      push.sendPush(store._id.toString(), {
        title: '⚠️ Missed Lead - Trial Expired',
        body: `${customerInfo}${phoneInfo} tried to connect but your trial limit is reached. Upgrade to continue!`,
        url: '/dashboard',
        apiBase: `${process.env.SERVER_URL || 'http://localhost:5000'}/api`,
      }).catch(() => {});

      // In-app notification
      if (notify && io) {
        notify.send(io, store._id.toString(), 'trial_expired_lead', 'Missed Lead!', `${customerInfo}${phoneInfo} tried to connect. Upgrade your plan to not miss customers.`);
      }

      return res.status(403).json({ error: 'limit_reached', message: 'Our team is currently unavailable. Please leave your number and we\'ll connect with you shortly.' });
    }

    // Create call as "pending" — NO VideoSDK room yet (saves billing)
    const call = await Call.create({
      storeId: store._id,
      sdkKey,
      shopperName: shopperName || 'Anonymous',
      shopperPhone: shopperPhone || '',
      status: 'pending',
      startedAt: new Date(),
    });

    // Capture as TestedLead since a live SDK test is initiated
    try {
      await TestedLead.create({
        name: shopperName || 'Shopper',
        phone: shopperPhone || 'N/A'
      });
    } catch (leadErr) {
      console.error('Failed to auto-capture tested lead in video/join-meeting:', leadErr);
    }

    // Increment trial usage
    if (store.plan === 'trial') {
      store.trialCustomersUsed += 1;
      await store.save();
    }

    res.json({ callId: call._id });

    // Send push notification to store agents/owner (async)
    const push = require('./push');
    push.sendPush(store._id.toString(), {
      title: '📞 Incoming Call',
      body: `${shopperName || 'A customer'} wants to connect live`,
      url: '/dashboard',
      callId: call._id.toString(),
      apiBase: `${process.env.SERVER_URL || 'http://localhost:5000'}/api`,
    }).catch(() => {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agent accepts — NOW create VideoSDK room and notify shopper via socket
router.post('/agent-join', auth, async (req, res) => {
  try {
    const { callId } = req.body;
    const call = await Call.findById(callId);
    if (!call) return res.status(404).json({ error: 'Call not found' });
    if (call.status === 'connected') return res.status(409).json({ error: 'Call already picked by another agent' });

    // NOW create VideoSDK room (billing starts here)
    const serverToken = generateServerToken();
    const response = await fetch(`${process.env.VIDEOSDK_API_ENDPOINT}/rooms`, {
      method: 'POST',
      headers: { Authorization: serverToken, 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!data.roomId) return res.status(500).json({ error: 'Failed to create video room' });

    // Update call record
    call.status = 'connected';
    call.agentName = req.user.name;
    call.agentId = req.user.id;
    call.meetingId = data.roomId;
    await call.save();

    // Mark agent as busy
    const PushSub = require('../models/PushSub');
    await PushSub.updateMany({ userId: req.user.id }, { busy: true });

    const clientToken = generateClientToken();

    // Notify shopper via socket that room is ready
    const io = req.app.get('io');
    if (io) {
      io.to(`call:${callId}`).emit('call-accepted', { meetingId: data.roomId, token: clientToken });
    }

    res.json({ token: clientToken, meetingId: data.roomId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// End call
router.post('/end-call', async (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const { callId } = body;
    const call = await Call.findById(callId);
    if (call) {
      call.endedAt = new Date();
      call.duration = Math.round((call.endedAt - call.startedAt) / 1000);
      if (!call.agentName) call.status = 'missed';
      await call.save();
      // Mark agent as free
      if (call.agentId) {
        const PushSub = require('../models/PushSub');
        await PushSub.updateMany({ userId: call.agentId }, { busy: false });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject call from notification
router.post('/reject-call', async (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const { callId } = body;
    const call = await Call.findById(callId);
    if (call && call.status === 'pending') {
      call.status = 'rejected';
      call.endedAt = new Date();
      call.duration = 0;
      await call.save();
      // Notify shopper via socket
      const io = req.app.get('io');
      if (io) io.to(`call:${callId}`).emit('call-rejected');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shopper cancelled before agent joined
router.post('/cancel-call', async (req, res) => {
  try {
    const { callId } = req.body;
    const call = await Call.findById(callId);
    if (call && call.status === 'pending') {
      call.status = 'missed';
      call.endedAt = new Date();
      call.duration = 0;
      await call.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
