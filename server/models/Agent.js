const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isOnline: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', agentSchema);
