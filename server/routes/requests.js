const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Contact = require('../models/Contact');
const Lead = require('../models/Lead');
const TestedLead = require('../models/TestedLead');

function adminAuth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'superadmin') return res.status(403).json({ error: 'Not admin' });
    req.admin = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// Public: submit contact request
router.post('/contact', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
    const contact = await Contact.create({ name, phone });
    res.json({ success: true, id: contact._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Public: submit lead (book demo)
router.post('/leads', async (req, res) => {
  try {
    const { name, email, phone, preferredDate, preferredTime } = req.body;
    if (!name || !email || !phone || !preferredDate || !preferredTime) return res.status(400).json({ error: 'All fields required' });
    const lead = await Lead.create({ name, email, phone, preferredDate, preferredTime });
    res.json({ success: true, id: lead._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Public: submit live tested widget lead
router.post('/tested-leads', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
    const lead = await TestedLead.create({ name, phone });
    res.json({ success: true, id: lead._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: get all contacts
router.get('/contact', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(contacts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: get all leads
router.get('/leads', adminAuth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    res.json(leads);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: get all live tested leads
router.get('/tested-leads', adminAuth, async (req, res) => {
  try {
    const leads = await TestedLead.find().sort({ createdAt: -1 }).lean();
    res.json(leads);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update contact status
router.patch('/contact/:id', adminAuth, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update lead status
router.patch('/leads/:id', adminAuth, async (req, res) => {
  try {
    await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update live tested lead status
router.patch('/tested-leads/:id', adminAuth, async (req, res) => {
  try {
    await TestedLead.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
