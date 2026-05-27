const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  callId: { type: String, required: true, index: true },
  sender: { type: String, required: true },
  senderRole: { type: String, enum: ['shopper', 'agent'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
