import React, { useState, useEffect } from 'react';
import { API } from '../App';

const DEFAULT_CAREERS = {
  title: 'Build the future of',
  highlight: 'live retail',
  subtitle: 'We are on a mission to bring human connection back to online shopping. If you love building fast, high-impact products, we would love to have you on board.',
  roles: [
    { title: 'Senior WebRTC Engineer', team: 'Engineering', location: 'Kolkata, India / Remote', type: 'Full-time', desc: 'Help us optimize and scale our video infrastructure. Deep knowledge of WebRTC, peer-to-peer signaling, and TURN/STUN servers is required.' },
    { title: 'Frontend Engineer (React)', team: 'Product', location: 'Kolkata, India / Remote', type: 'Full-time', desc: 'Craft premium dashboards, real-time calling interfaces, and embeddable customer widgets. Experience with CSS animations and React is key.' },
    { title: 'Sales & Merchant Success Manager', team: 'Growth', location: 'Mumbai/Bangalore, India', type: 'Full-time', desc: 'Onboard and consult boutique stores, jewelry brands, and luxury e-commerce sellers in adopting live video commerce.' }
  ]
};

export default function Careers({ dark, c }) {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('site_content');
      const data = cached ? JSON.parse(cached) : null;
      return data && data.careers ? { ...DEFAULT_CAREERS, ...data.careers } : DEFAULT_CAREERS;
    } catch {
      return DEFAULT_CAREERS;
    }
  });

  useEffect(() => {
    document.title = 'Careers | Join ShopCall';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Join the ShopCall team and help us build the future of live video commerce for e-commerce brands.');
    window.scrollTo(0, 0);

    fetch(`${API}/site`)
      .then(r => r.json())
      .then(d => {
        if (d && d.careers) {
          setContent({ ...DEFAULT_CAREERS, ...d.careers });
          localStorage.setItem('site_content', JSON.stringify(d));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="lp-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 100px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>We are hiring</span>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginTop: 16, marginBottom: 20, letterSpacing: '-0.03em' }}>
          {content.title} <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{content.highlight}</span>
        </h1>
        <p style={{ fontSize: 18, color: c.muted, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          {content.subtitle}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 80 }}>
        {[
          { icon: '🚀', t: 'Fast Growth', d: 'Work in a fast-paced environment with a high degree of ownership and zero bureaucracy.' },
          { icon: '💻', t: 'Modern Stack', d: 'Build using React 18, WebRTC, MediaPipe AI background blur, and Node.js microservices.' },
          { icon: '🌴', t: 'Flexibility', d: 'We offer remote-first options, flexible working hours, and mental wellness leaves.' }
        ].map((b, idx) => (
          <div key={idx} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
            <span style={{ fontSize: 24 }}>{b.icon}</span>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 12, marginBottom: 8 }}>{b.t}</h4>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.5 }}>{b.d}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30 }}>Open Positions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {content.roles.map((role, idx) => (
            <div key={idx} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>{role.title}</h3>
                  <span style={{ background: 'rgba(99,102,241,0.06)', color: '#6366f1', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{role.team}</span>
                </div>
                <p style={{ fontSize: 13, color: c.muted, marginBottom: 12 }}>{role.location} · {role.type}</p>
                <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.6 }}>{role.desc}</p>
              </div>
              <a href="mailto:careers@shopcall.store" className="lp-cta" style={{ textDecoration: 'none', background: '#6366f1', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>Apply Now</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
