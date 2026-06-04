import React, { useState, useEffect } from 'react';
import { API } from '../App';

const DEFAULT_ABOUT = {
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
};

export default function About({ dark, c }) {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('site_content');
      const data = cached ? JSON.parse(cached) : null;
      return data && data.about ? { ...DEFAULT_ABOUT, ...data.about } : DEFAULT_ABOUT;
    } catch {
      return DEFAULT_ABOUT;
    }
  });

  useEffect(() => {
    document.title = 'About Us | ShopCall - Live Video Commerce for E-commerce';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Learn about ShopCall, our mission to humanize e-commerce through live video interaction, and how we help sellers boost conversions.');
    }
    window.scrollTo(0, 0);

    fetch(`${API}/site`)
      .then(r => r.json())
      .then(d => {
        if (d && d.about) {
          setContent({ ...DEFAULT_ABOUT, ...d.about });
          // Sync backend site_content to localStorage
          localStorage.setItem('site_content', JSON.stringify(d));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="lp-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 100px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Our Story</span>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginTop: 16, marginBottom: 20, letterSpacing: '-0.03em' }}>
          {content.title} <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{content.highlight}</span>
        </h1>
        <p style={{ fontSize: 18, color: c.muted, lineHeight: 1.6, maxWidth: 650, margin: '0 auto' }}>
          {content.subtitle}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 80, alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{content.storyTitle}</h2>
          <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8, marginBottom: 16 }}>
            {content.storyContent1}
          </p>
          <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8 }}>
            {content.storyContent2}
          </p>
        </div>
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: '#6366f1' }}>3-5x</h3>
              <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Conversion Rate Increase</p>
              <p style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>Compared to standard text chat support or static product listings.</p>
            </div>
            <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 20 }}>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: '#a78bfa' }}>&lt; 2 mins</h3>
              <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Setup Integration Time</p>
              <p style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>Just copy one script tag into your website body. No developers needed.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 60 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30, textAlign: 'center' }}>Our Core Principles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {content.principles.map((item, idx) => (
            <div key={idx} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{item.t}</h4>
              <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.6 }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
