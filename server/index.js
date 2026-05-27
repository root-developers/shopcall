require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);

// Allowed origins
const ALLOWED_ORIGINS = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:3000'];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true }
});

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: 'text/plain' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts, try again later' } });

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/admin/login', authLimiter);

// Static SDK
app.use('/sdk', express.static(path.join(__dirname, 'sdk')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/calls', require('./routes/calls'));
app.use('/api/video', require('./routes/video'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/push', require('./routes/push'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/site', require('./routes/site'));

const notifications = require('./routes/notifications');
app.use('/api/notifications', notifications);

// Make io accessible to routes
app.set('io', io);
app.set('notify', notifications);

// Chat history endpoint
app.get('/api/chat/:callId', async (req, res) => {
  try {
    const msgs = await Chat.find({ callId: req.params.callId }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Socket.IO for real-time chat + notifications
io.on('connection', (socket) => {
  socket.on('join-room', (callId) => { if (callId) socket.join(callId); });
  socket.on('register-user', (userId) => {
    if (userId) { socket.userId = userId; socket.join(`user:${userId}`); }
  });
  socket.on('chat-message', async ({ callId, sender, senderRole, message }) => {
    if (!callId || !message || !sender) return;
    try {
      await Chat.create({ callId, sender: String(sender).slice(0, 50), senderRole: ['shopper', 'agent'].includes(senderRole) ? senderRole : 'shopper', message: String(message).slice(0, 1000) });
      socket.to(callId).emit('chat-message', { sender, senderRole, message, createdAt: new Date() });
    } catch (e) {}
  });
});

// Init notification socket
notifications.initSocket(io);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
