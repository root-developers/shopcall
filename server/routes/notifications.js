const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// In-memory socket map (userId -> socketId)
const userSockets = {};

// Initialize socket notifications
router.initSocket = function(io) {
  io.on('connection', (socket) => {
    socket.on('register-user', (userId) => {
      if (userId) { userSockets[userId] = socket.id; socket.userId = userId; }
    });
    socket.on('disconnect', () => {
      if (socket.userId) delete userSockets[socket.userId];
    });
  });
};

// Send notification (call from anywhere in server)
router.send = async function(io, userId, type, title, body) {
  const notif = await Notification.create({ userId, type, title, body });
  // Emit via socket if user is online
  if (userSockets[userId]) {
    io.to(userSockets[userId]).emit('notification', { _id: notif._id, type, title, body, read: false, createdAt: notif.createdAt });
  }
  return notif;
};

// Send to all admins
router.sendToAdmins = async function(io, type, title, body) {
  const Admin = require('../models/Admin');
  const admins = await Admin.find().select('_id');
  for (const admin of admins) {
    await router.send(io, admin._id.toString(), type, title, body);
  }
};

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifs);
});

// Mark as read
router.post('/read', auth, async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  res.json({ success: true });
});

// Mark single as read
router.post('/:id/read', auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// Unread count
router.get('/unread', auth, async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.id, read: false });
  res.json({ count });
});

module.exports = router;
