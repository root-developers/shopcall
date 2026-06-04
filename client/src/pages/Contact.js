import React, { useState, useEffect } from 'react';
import { API } from '../App';

export default function Contact({ dark, c }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    document.title = 'Contact Us | ShopCall - Live Video Commerce for E-commerce';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Get in touch with the ShopCall team. Reach out for sales, partner opportunities, custom pricing, or customer support queries.');
    }
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setStatus('');

    try {
      // Send to contact endpoint
      const res = await fetch(`${API}/requests/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone })
      });

      if (res.ok) {
        setStatus('✓ Message sent successfully! We will contact you shortly.');
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        const errData = await res.json();
        setStatus(errData.error || 'Failed to submit request. Please try again.');
      }
    } catch {
      setStatus('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="lp-enter" style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px 100px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Get in Touch</span>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginTop: 16, marginBottom: 20, letterSpacing: '-0.03em' }}>
          We'd love to <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>hear from you</span>
        </h1>
        <p style={{ fontSize: 16, color: c.muted, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          Have questions about pricing, features, or custom integrations? Drop us a line and we'll get back to you within 24 hours.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48 }}>
        {/* Contact Form */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Send a Message</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Name</label>
              <input 
                required
                type="text" 
                placeholder="Your Name" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email Address</label>
              <input 
                required
                type="email" 
                placeholder="you@example.com" 
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Phone Number</label>
              <input 
                required
                type="tel" 
                placeholder="+91 98765 43210" 
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>How can we help?</label>
              <textarea 
                rows="4"
                placeholder="Describe your inquiry..." 
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, outline: 'none', resize: 'vertical', minHeight: 100, transition: 'border-color 0.2s' }} 
              />
            </div>

            {status && (
              <p style={{ fontSize: 14, color: status.startsWith('✓') ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
                {status}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="lp-cta"
              style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
            >
              {loading ? 'Sending...' : 'Submit Message'}
            </button>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, justifyContent: 'center' }}>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Email Support</h4>
            <p style={{ fontSize: 15, color: c.muted, marginBottom: 4 }}>For sales, media, or business inquiries:</p>
            <a href="mailto:hello@shopcall.store" style={{ color: '#6366f1', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>hello@shopcall.store</a>
          </div>

          <div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Office Address</h4>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.6 }}>
              ShopCall Technologies Private Limited,<br />
              9th Floor, Tech Hub Sector V,<br />
              Kolkata, WB 700091, India
            </p>
          </div>

          <div style={{ padding: 24, background: 'rgba(99,102,241,0.03)', borderRadius: 12, border: `1px solid ${c.border}` }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: '#6366f1', marginBottom: 6 }}>Immediate Assistance?</h4>
            <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.5 }}>
              Use the float widget at the bottom right corner of our demo page to talk to one of our live agents instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
