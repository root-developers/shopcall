const router = require('express').Router();
const jwt = require('jsonwebtoken');
const SiteContent = require('../models/SiteContent');

// Default content (used when DB is empty)
const DEFAULTS = {
  hero: {
    badge: 'Now in public beta',
    title: 'Turn your website into a',
    titleHighlight: 'live showroom',
    subtitle: 'One script tag adds a "Live Shop" button to your store. Customers click, you connect via video, show products, and close the deal — all without them leaving your site.',
    cta: 'Start free',
    ctaSecondary: 'Watch demo',
    note: 'Free forever for 5 calls · No credit card',
  },
  stats: [
    { v: '500+', l: 'Stores' },
    { v: '10K+', l: 'Calls' },
    { v: '3.2x', l: 'More conversions' },
    { v: '<2min', l: 'Setup' },
  ],
  platforms: ['Shopify', 'WooCommerce', 'Magento', 'Custom'],
  features: [
    { icon: '⚡', title: 'One-line Integration', desc: 'No npm install. No build step. Just paste a script tag and you\'re live.' },
    { icon: '📹', title: 'HD Video Calls', desc: 'Optimised for Indian networks. Works flawlessly on 4G with adaptive bitrate.' },
    { icon: '💳', title: 'In-call Checkout', desc: 'Share product links, apply coupons, and close the sale — all inside the call.' },
    { icon: '📊', title: 'Real-time Analytics', desc: 'Every call tracked. See who connected, who dropped, and your conversion rate.' },
    { icon: '👥', title: 'Team Management', desc: 'Add agents, assign roles. Everyone gets their own dashboard to handle calls.' },
    { icon: '🛡️', title: 'Enterprise Security', desc: 'Encrypted streams. No recordings stored. Your customer data stays yours.' },
  ],
  steps: [
    { title: 'Create account', desc: 'Sign up in 30 seconds. No card needed.' },
    { title: 'Copy your snippet', desc: 'One script tag from your dashboard.' },
    { title: 'Paste before </body>', desc: 'Works with any platform — Shopify, Woo, custom.' },
    { title: 'Go live', desc: 'Customers see "Live Shop" button instantly.' },
  ],
  pricing: [
    { name: 'Free', price: '₹0', sub: '5 calls included', features: ['1 agent seat', 'Call analytics', 'SDK integration', 'Community support'], popular: false },
    { name: 'Starter', price: '₹999', sub: 'per month', features: ['200 calls/mo', '3 agent seats', 'Priority support', 'Custom branding'], popular: true },
    { name: 'Pro', price: '₹2,999', sub: 'per month', features: ['Unlimited calls', '10 agent seats', 'Scheduling', 'API access', 'Dedicated CSM'], popular: false },
  ],
  finalCta: {
    title: 'Ready to go live?',
    subtitle: 'Join 500+ Indian brands selling more with live video commerce. Setup takes less than 2 minutes.',
    button: 'Get your SDK key',
    note: 'No credit card · Free 5 calls · Cancel anytime',
  },
};

// Admin auth middleware
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

// GET /api/site - public, returns landing page content
router.get('/', async (req, res) => {
  try {
    let content = await SiteContent.findOne().lean();
    if (!content) content = DEFAULTS;
    res.json(content);
  } catch (err) {
    res.json(DEFAULTS);
  }
});

// PUT /api/site - admin only, update landing page content
router.put('/', adminAuth, async (req, res) => {
  try {
    const data = req.body;
    let content = await SiteContent.findOne();
    if (content) {
      Object.assign(content, data);
      await content.save();
    } else {
      content = await SiteContent.create({ ...DEFAULTS, ...data });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
