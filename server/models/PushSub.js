const mongoose = require('mongoose');

const pushSubSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  storeId: { type: String, required: true, index: true },
  role: { type: String, enum: ['owner', 'agent'], required: true },
  subscription: { type: Object, required: true },
  busy: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PushSub', pushSubSchema);
