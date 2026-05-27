const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

// Owner: list agents for their store
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find({ storeId: req.user.id }).select('-password');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Owner: add agent
router.post('/', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    if (await Agent.findOne({ email })) return res.status(400).json({ error: 'Agent email already exists' });
    await Agent.create({ name, email, storeId: req.user.id });
    const agents = await Agent.find({ storeId: req.user.id }).select('-password');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add agent' });
  }
});

// Owner: remove agent
router.delete('/:agentId', auth, async (req, res) => {
  try {
    await Agent.findOneAndDelete({ _id: req.params.agentId, storeId: req.user.id });
    const agents = await Agent.find({ storeId: req.user.id }).select('-password');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove agent' });
  }
});

// Agent: set password (first time setup)
router.post('/set-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const agent = await Agent.findOne({ email });
    if (!agent) return res.status(404).json({ error: 'Agent not found. Ask store owner to add you.' });
    if (agent.password) return res.status(400).json({ error: 'Password already set. Use login.' });
    agent.password = await bcrypt.hash(password, 10);
    await agent.save();
    const token = jwt.sign({ id: agent._id, storeId: agent.storeId.toString(), role: 'agent', name: agent.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, agent: { id: agent._id, name: agent.name, email: agent.email, role: 'agent' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// Agent: login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const agent = await Agent.findOne({ email });
    if (!agent) return res.status(400).json({ error: 'Agent not found' });
    if (!agent.password) return res.status(400).json({ error: 'Password not set. Please set your password first.' });
    if (!(await bcrypt.compare(password, agent.password))) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: agent._id, storeId: agent.storeId.toString(), role: 'agent', name: agent.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, agent: { id: agent._id, name: agent.name, email: agent.email, role: 'agent' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Agent: get incoming calls for their store
router.get('/incoming', auth, async (req, res) => {
  try {
    if (!req.user.storeId) return res.status(403).json({ error: 'Not an agent' });
    const Call = require('../models/Call');
    const calls = await Call.find({
      storeId: req.user.storeId,
      status: 'pending',
      startedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    }).sort({ startedAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incoming calls' });
  }
});

module.exports = router;
