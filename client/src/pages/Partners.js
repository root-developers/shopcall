import React, { useState, useEffect } from 'react';
import { API } from '../App';

const DEFAULT_PARTNERS = {
  title: 'Grow your agency with',
  highlight: 'Live Commerce',
  subtitle: 'Partner with ShopCall to introduce premium live video shopping tools to your clients, Shopify stores, and custom e-commerce brands.',
  perks: [
    { t: '20% Recurring Revenue Share', d: 'Earn a lifetime 20% recurring commission on all subscription payments made by the stores you refer.' },
    { t: 'Technical Co-marketing & Support', d: 'Get direct priority access to our WebRTC engineering teams and features tailored for your enterprise clients.' },
    { t: 'Partner Sandbox Account', d: 'Access specialized developer sandboxes to demonstrate and test video widget configurations for your leads.' }
  ]
};

export default function Partners({ dark, c }) {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('site_content');
      const data = cached ? JSON.parse(cached) : null;
      return data && data.partners ? { ...DEFAULT_PARTNERS, ...data.partners } : DEFAULT_PARTNERS;
    } catch {
      return DEFAULT_PARTNERS;
    }
  });
  const [form, setForm] = useState({ name: '', email: '', company: '', site: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Partner Program | ShopCall';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Join the ShopCall partner program. Refer merchants, implement live video calling widgets, and earn recurring revenue share.');
    window.scrollTo(0, 0);

    fetch(`${API}/site`)
      .then(r => r.json())
      .then(d => {
        if (d && d.partners) {
          setContent({ ...DEFAULT_PARTNERS, ...d.partners });
          localStorage.setItem('site_content', JSON.stringify(d));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setStatus('✓ Application submitted! Our partner desk will review and contact you in 24 hours.');
      setForm({ name: '', email: '', company: '', site: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="lp-enter" style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px 100px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Partner Program</span>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginTop: 16, marginBottom: 20, letterSpacing: '-0.03em' }}>
          {content.title} <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{content.highlight}</span>
        </h1>
        <p style={{ fontSize: 18, color: c.muted, lineHeight: 1.6, maxWidth: 650, margin: '0 auto' }}>
          {content.subtitle}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, marginBottom: 80 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Why Partner with Us?</h2>
          <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8, marginBottom: 20 }}>
            E-commerce agencies, web design firms, and independent developers use ShopCall to give their merchants a high-impact conversion booster. Integrating our SDK is incredibly fast, allowing you to add value without extending your build timelines.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {content.perks.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{p.t}</h4>
                  <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.5 }}>{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 36, boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Apply for Partner Access</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Full Name</label>
              <input 
                required
                type="text" 
                placeholder="Your Name" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 14, outline: 'none' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email Address</label>
              <input 
                required
                type="email" 
                placeholder="you@agency.com" 
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 14, outline: 'none' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Agency/Company Name</label>
              <input 
                required
                type="text" 
                placeholder="Agency Name" 
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 14, outline: 'none' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Website URL</label>
              <input 
                required
                type="url" 
                placeholder="https://agency.com" 
                value={form.site}
                onChange={e => setForm({ ...form, site: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 14, outline: 'none' }} 
              />
            </div>

            {status && (
              <p style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>
                {status}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="lp-cta"
              style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Submitting...' : 'Apply Now →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
