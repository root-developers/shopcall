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
    { v: '46.2%', l: 'Market CAGR' },
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
    subtitle: 'Position your brand at the forefront of India\'s live commerce boom. Setup takes less than 2 minutes.',
    button: 'Get your SDK key',
    note: 'No credit card · Free 5 calls · Cancel anytime',
  },
  footer: {
    tagline: 'Live video commerce for Indian e-commerce. Help your customers see, ask, and buy — all in one call. Built for conversions, not just conversations.',
    columns: [
      { title: 'Product', links: [{ label: 'Features', url: '#features' }, { label: 'Pricing', url: '#pricing' }, { label: 'How it Works', url: '#how-it-works' }, { label: 'SDK Integration', url: '/docs' }, { label: 'Demo Store', url: '/demo' }] },
      { title: 'Company', links: [{ label: 'About Us', url: '/about' }, { label: 'Blog', url: '/blog' }, { label: 'Careers', url: '/careers' }, { label: 'Contact Us', url: '/contact' }, { label: 'Partner Program', url: '/partners' }] },
      { title: 'Legal', links: [{ label: 'Terms of Service', url: '/terms' }, { label: 'Privacy Policy', url: '/privacy' }, { label: 'Cancellation & Refund', url: '/refund' }, { label: 'Shipping Policy', url: '/shipping' }, { label: 'Grievance Redressal', url: '/grievance' }] },
    ],
    copyright: '© 2026 ShopCall Technologies Pvt. Ltd. All rights reserved. Made with ❤️ in India.',
    socials: [{ platform: 'Twitter', url: 'https://twitter.com/shopcall_in' }, { platform: 'LinkedIn', url: 'https://linkedin.com/company/shopcall' }, { platform: 'Instagram', url: 'https://instagram.com/shopcall.in' }, { platform: 'YouTube', url: 'https://youtube.com/@shopcall' }],
  },
  scale: 100,
  about: {
    title: 'Humanizing the',
    highlight: 'Online Showroom',
    subtitle: 'ShopCall was founded to bridge the massive trust and conversion gap between physical retail stores and static digital shopping websites.',
    storyTitle: 'Why ShopCall?',
    storyContent1: 'In traditional physical retail, a sales agent greets customers, shows products live, answers questions instantly, and builds trust. In online shopping, customers are left with flat pictures and text descriptions, leading to low conversion rates and high return rates.',
    storyContent2: 'We created ShopCall to bring back the human touch. Our SDK allows any merchant—from boutique fashion sellers to premium electronics stores—to invite customers into their showroom with just one click.',
    principles: [
      { t: 'Frictionless Experience', d: 'No downloads, signups, or logins. A customer clicks a button and is instantly in a video call inside their browser.' },
      { t: 'Built for Scale', d: 'Engineered on top of world-class video infrastructure that functions perfectly on mobile and low-bandwidth networks.' },
      { t: 'Merchant First', d: 'Simple dashboard analytics, agent logins, and flexible custom configurations tailored for individual brand identities.' }
    ]
  },
  careers: {
    title: 'Build the future of',
    highlight: 'live retail',
    subtitle: 'We are on a mission to bring human connection back to online shopping. If you love building fast, high-impact products, we would love to have you on board.',
    roles: [
      { title: 'Senior WebRTC Engineer', team: 'Engineering', location: 'Kolkata, India / Remote', type: 'Full-time', desc: 'Help us optimize and scale our video infrastructure. Deep knowledge of WebRTC, peer-to-peer signaling, and TURN/STUN servers is required.' },
      { title: 'Frontend Engineer (React)', team: 'Product', location: 'Kolkata, India / Remote', type: 'Full-time', desc: 'Craft premium dashboards, real-time calling interfaces, and embeddable customer widgets. Experience with CSS animations and React is key.' },
      { title: 'Sales & Merchant Success Manager', team: 'Growth', location: 'Mumbai/Bangalore, India', type: 'Full-time', desc: 'Onboard and consult boutique stores, jewelry brands, and luxury e-commerce sellers in adopting live video commerce.' }
    ]
  },
  partners: {
    title: 'Grow your agency with',
    highlight: 'Live Commerce',
    subtitle: 'Partner with ShopCall to introduce premium live video shopping tools to your clients, Shopify stores, and custom e-commerce brands.',
    perks: [
      { t: '20% Recurring Revenue Share', d: 'Earn a lifetime 20% recurring commission on all subscription payments made by the stores you refer.' },
      { t: 'Technical Co-marketing & Support', d: 'Get direct priority access to our WebRTC engineering teams and features tailored for your enterprise clients.' },
      { t: 'Partner Sandbox Account', d: 'Access specialized developer sandboxes to demonstrate and test video widget configurations for your leads.' }
    ]
  },
  docs: {
    title: 'SDK Integration Guide',
    subtitle: 'Add a floating Live Video Commerce widget to any store with a single line of JavaScript.',
    scriptSnippet: '<script \n  src="https://shopcall.store/sdk/shopcall-sdk.js" \n  data-store="YOUR_SDK_KEY">\n</script>'
  },
  demo: {
    title: 'AURA BOUTIQUE',
    subtitle: 'EXCLUSIVE HANDLOOM COLLECTION',
    products: [
      { name: 'Royal Banarasi Silk Saree', price: '₹14,999', desc: 'Handwoven pure silk Banarasi saree with rich zari border and floral motifs. Perfect for bridal events.', img: '🌸' },
      { name: 'Kundan Antique Gold Necklace', price: '₹48,500', desc: 'Traditional Kundan studded choker necklace set in gold plating with matching earrings.', img: '💎' },
      { name: 'Designer Georgette Lehenga', price: '₹34,999', desc: 'Ethereal emerald green lehenga choli set with intricate hand embroidery and sequins work.', img: '👗' }
    ]
  }
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

function deepMerge(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined && source[key] !== null) {
      result[key] = source[key];
    }
  }
  return result;
}

// GET /api/site - public, returns landing page content
router.get('/', async (req, res) => {
  try {
    let content = await SiteContent.findOne().lean();
    if (!content) {
      return res.json(DEFAULTS);
    }
    const merged = deepMerge(DEFAULTS, content);
    res.json(merged);
  } catch (err) {
    res.json(DEFAULTS);
  }
});

// PUT /api/site - admin only, update landing page content
router.put('/', adminAuth, async (req, res) => {
  try {
    const data = req.body;
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;

    const content = await SiteContent.findOne();
    if (content) {
      // Completely replace the existing document to overwrite modified arrays and fields cleanly
      await SiteContent.replaceOne({ _id: content._id }, data);
    } else {
      await SiteContent.create(data);
    }
    const updated = await SiteContent.findOne().lean();
    const merged = deepMerge(DEFAULTS, updated);
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
