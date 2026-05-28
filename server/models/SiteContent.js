const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  // Hero section
  hero: {
    badge: { type: String, default: 'Now in public beta' },
    title: { type: String, default: 'Turn your website into a' },
    titleHighlight: { type: String, default: 'live showroom' },
    subtitle: { type: String, default: 'One script tag adds a "Live Shop" button to your store. Customers click, you connect via video, show products, and close the deal — all without them leaving your site.' },
    cta: { type: String, default: 'Start free' },
    ctaSecondary: { type: String, default: 'Watch demo' },
    note: { type: String, default: 'Free forever for 5 calls · No credit card' },
  },
  // Stats strip
  stats: [{ v: String, l: String }],
  // Platform logos
  platforms: [String],
  // Features
  features: [{
    icon: String,
    title: String,
    desc: String,
  }],
  // Steps
  steps: [{
    title: String,
    desc: String,
  }],
  // Pricing
  pricing: [{
    name: String,
    price: String,
    sub: String,
    features: [String],
    popular: { type: Boolean, default: false },
  }],
  // Final CTA
  finalCta: {
    title: { type: String, default: 'Ready to go live?' },
    subtitle: { type: String, default: 'Join 500+ Indian brands selling more with live video commerce. Setup takes less than 2 minutes.' },
    button: { type: String, default: 'Get your SDK key' },
    note: { type: String, default: 'No credit card · Free 5 calls · Cancel anytime' },
  },
  // Footer
  footer: {
    tagline: { type: String, default: 'We believe better conversations lead to better conversions. Building to level up customer engagement.' },
    columns: [{
      title: String,
      links: [{ label: String, url: String }],
    }],
    copyright: { type: String, default: '© 2026 ShopCall. All rights reserved.' },
    socials: [{ platform: String, url: String }],
  },
  // Landing page scale (percentage)
  scale: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);
