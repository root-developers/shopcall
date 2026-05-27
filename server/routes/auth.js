const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, storeName, storeUrl } = req.body;
    if (!name || !email || !password || !storeName) return res.status(400).json({ error: 'Name, email, password, and store name are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const sdkKey = 'sc_live_' + uuidv4().slice(0, 8);
    const user = await User.create({ name, email, password: hashed, storeName, storeUrl, sdkKey });
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, storeName: user.storeName, sdkKey: user.sdkKey, plan: user.plan } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, storeName: user.storeName, sdkKey: user.sdkKey, plan: user.plan, trialCustomersUsed: user.trialCustomersUsed, trialLimit: user.trialLimit } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

module.exports = router;
