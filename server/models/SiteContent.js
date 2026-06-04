const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  // Hero section
  hero: {
    badge: { type: String },
    title: { type: String },
    titleHighlight: { type: String },
    subtitle: { type: String },
    cta: { type: String },
    ctaSecondary: { type: String },
    note: { type: String },
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
    popular: { type: Boolean },
  }],
  // Final CTA
  finalCta: {
    title: { type: String },
    subtitle: { type: String },
    button: { type: String },
    note: { type: String },
  },
  // Footer
  footer: {
    tagline: { type: String },
    columns: [{
      title: String,
      links: [{ label: String, url: String }],
    }],
    copyright: { type: String },
    socials: [{ platform: String, url: String }],
  },
  // Landing page scale (percentage)
  scale: { type: Number },

  // --- EXTENDED SUBPAGES CONTENT ---
  // About Page
  about: {
    title: { type: String },
    highlight: { type: String },
    subtitle: { type: String },
    storyTitle: { type: String },
    storyContent1: { type: String },
    storyContent2: { type: String },
    principles: [{
      t: String,
      d: String
    }]
  },

  // Careers Page
  careers: {
    title: { type: String },
    highlight: { type: String },
    subtitle: { type: String },
    roles: [{
      title: String,
      team: String,
      location: String,
      type: String,
      desc: String
    }]
  },

  // Partners Page
  partners: {
    title: { type: String },
    highlight: { type: String },
    subtitle: { type: String },
    perks: [{
      t: String,
      d: String
    }]
  },

  // Docs Page
  docs: {
    title: { type: String },
    subtitle: { type: String },
    scriptSnippet: { type: String }
  },

  // Demo Page
  demo: {
    title: { type: String },
    subtitle: { type: String },
    products: [{
      name: String,
      price: String,
      desc: String,
      img: String
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);
