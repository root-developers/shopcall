const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sdkKey: { type: String, required: true },
  shopperName: { type: String, default: 'Anonymous' },
  shopperPhone: { type: String },
  agentName: { type: String },
  agentId: { type: String },
  status: { type: String, enum: ['pending', 'connected', 'missed', 'rejected', 'scheduled'], default: 'pending' },
  duration: { type: Number, default: 0 },
  meetingId: { type: String },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
});

module.exports = mongoose.model('Call', callSchema);
