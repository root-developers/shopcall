const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'pending' },
  method: { type: String, enum: ['manual', 'razorpay', 'admin'], default: 'manual' },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Billing', billingSchema);
