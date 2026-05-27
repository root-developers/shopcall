const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true }, // upgrade_request, upgrade_approved, upgrade_rejected, call_missed, etc.
  title: { type: String, required: true },
  body: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notifSchema);
