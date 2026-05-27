const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  storeName: { type: String, required: true },
  storeUrl: { type: String },
  sdkKey: { type: String, unique: true },
  plan: { type: String, enum: ['trial', 'starter', 'pro'], default: 'trial' },
  planActivatedAt: { type: Date },
  billingCycleEnd: { type: Date },
  trialCustomersUsed: { type: Number, default: 0 },
  trialLimit: { type: Number, default: 5 },
  agents: [{ name: String, email: String, isOnline: { type: Boolean, default: false } }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
