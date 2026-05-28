import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

const DEFAULT_FEATURES = [
  { icon: '⚡', title: 'One-line Integration', desc: 'No npm install. No build step. Just paste a script tag and you\'re live.' },
  { icon: '📹', title: 'HD Video Calls', desc: 'Optimised for Indian networks. Works flawlessly on 4G with adaptive bitrate.' },
  { icon: '💳', title: 'In-call Checkout', desc: 'Share product links, apply coupons, and close the sale — all inside the call.' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Every call tracked. See who connected, who dropped, and your conversion rate.' },
  { icon: '👥', title: 'Team Management', desc: 'Add agents, assign roles. Everyone gets their own dashboard to handle calls.' },
  { icon: '🛡️', title: 'Enterprise Security', desc: 'Encrypted streams. No recordings stored. Your customer data stays yours.' },
];

const DEFAULT_STEPS = [
  { title: 'Create account', desc: 'Sign up in 30 seconds. No card needed.' },
  { title: 'Copy your snippet', desc: 'One script tag from your dashboard.' },
  { title: 'Paste before </body>', desc: 'Works with any platform — Shopify, Woo, custom.' },
  { title: 'Go live', desc: 'Customers see "Live Shop" button instantly.' },
];

const DEFAULT_CONTENT = {
  hero: { badge: 'Now in public beta', title: 'Turn your website into a', titleHighlight: 'live showroom', subtitle: 'One script tag adds a "Live Shop" button to your store. Customers click, you connect via video, show products, and close the deal — all without them leaving your site.', cta: 'Start free', ctaSecondary: 'Book Demo', note: 'Free forever for 5 calls · No credit card' },
  stats: [{ v: '500+', l: 'Stores' }, { v: '10K+', l: 'Calls' }, { v: '3.2x', l: 'More conversions' }, { v: '<2min', l: 'Setup' }],
  platforms: ['Shopify', 'WooCommerce', 'Magento', 'Custom'],
  features: DEFAULT_FEATURES,
  steps: DEFAULT_STEPS,
  pricing: [
    { name: 'Free', price: '₹0', sub: '5 calls included', features: ['1 agent seat', 'Call analytics', 'SDK integration', 'Community support'], popular: false },
    { name: 'Starter', price: '₹999', sub: 'per month', features: ['200 calls/mo', '3 agent seats', 'Priority support', 'Custom branding'], popular: true },
    { name: 'Pro', price: '₹2,999', sub: 'per month', features: ['Unlimited calls', '10 agent seats', 'Scheduling', 'API access', 'Dedicated CSM'], popular: false },
  ],
  finalCta: { title: 'Ready to go live?', subtitle: 'Join 500+ Indian brands selling more with live video commerce. Setup takes less than 2 minutes.', button: 'Get your SDK key', note: 'No credit card · Free 5 calls · Cancel anytime' },
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
};

export default function Landing() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [showContact, setShowContact] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => { localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    document.title = 'ShopCall - Live Video Shopping for E-commerce | Add Live Shop Button';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Add a Live Shop video call button to your e-commerce store with 2 lines of code. Connect with customers via HD video, show products live, and close sales 3x faster.');
    fetch(`${API}/site`).then(r => r.json()).then(d => { if (d && d.hero) setContent({ ...DEFAULT_CONTENT, ...d }); }).catch(() => {});
  }, []);
  const c = dark ? D : L;
  const { hero, stats, platforms, features, steps, pricing, finalCta, footer } = content;

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.lp-reveal,.lp-reveal-scale').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });

  return (
    <div role="main" style={{ background: c.bg, color: c.text, transition: 'all 0.4s ease', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}
        .lp-enter{animation:lpEnter .7s cubic-bezier(.16,1,.3,1) both}
        .lp-enter-d1{animation-delay:.1s}
        .lp-enter-d2{animation-delay:.2s}
        .lp-enter-d3{animation-delay:.3s}
        @keyframes lpEnter{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .lp-reveal{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .lp-reveal.visible{opacity:1;transform:translateY(0)}
        .lp-reveal-d1{transition-delay:.1s}
        .lp-reveal-d2{transition-delay:.2s}
        .lp-reveal-d3{transition-delay:.3s}
        .lp-reveal-d4{transition-delay:.4s}
        .lp-reveal-d5{transition-delay:.5s}
        .lp-reveal-scale{opacity:0;transform:scale(.92);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
        .lp-reveal-scale.visible{opacity:1;transform:scale(1)}
        .lp-card{transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s,border-color .3s}
        .lp-card:hover{transform:translateY(-8px);box-shadow:${dark?'0 20px 40px rgba(99,102,241,.12)':'0 20px 40px rgba(0,0,0,.08)'};border-color:#6366f1 !important}
        .lp-cta{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .lp-cta:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(99,102,241,.35)}
        .lp-cta:active{transform:translateY(0);box-shadow:0 4px 12px rgba(99,102,241,.2)}
        .lp-cta-ghost{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .lp-cta-ghost:hover{background:${dark?'#1a1a2e':'#f0f0ff'} !important;border-color:#6366f1 !important;transform:translateY(-3px)}
        .lp-theme{transition:transform .4s cubic-bezier(.16,1,.3,1)}
        .lp-theme:hover{transform:scale(1.15) rotate(15deg)}
        .lp-theme:active{transform:scale(.9)}
        .lp-glow{position:relative;overflow:visible}
        .lp-glow::after{content:'';position:absolute;inset:-2px;border-radius:inherit;background:linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa);opacity:.2;filter:blur(24px);z-index:-1;transition:opacity .4s,filter .4s}
        .lp-glow:hover::after{opacity:.4;filter:blur(32px)}
        .lp-float{animation:lpFloat 6s ease-in-out infinite}
        @keyframes lpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .lp-gradient-text{background:linear-gradient(135deg,#6366f1,#a78bfa,#6366f1);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:lpGradient 4s linear infinite}
        @keyframes lpGradient{to{background-position:200% center}}
        .lp-shimmer{position:relative;overflow:hidden}
        .lp-shimmer::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(99,102,241,.06),transparent);animation:lpShimmer 3s infinite}
        @keyframes lpShimmer{to{left:100%}}
        .lp-nav-link{position:relative}
        .lp-nav-link::after{content:'';position:absolute;bottom:-4px;left:50%;width:0;height:2px;background:#6366f1;border-radius:1px;transition:width .3s,left .3s}
        .lp-nav-link:hover::after{width:100%;left:0}
        .lp-nav-link:hover{color:${dark?'#f4f4f5':'#18181b'} !important}
        .lp-step-line{background:linear-gradient(180deg,#6366f1,${dark?'#1f1f23':'#e4e4e7'});transition:background .3s}
        .lp-counter{display:inline-block;transition:transform .3s}
        .lp-counter:hover{transform:scale(1.1)}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}
        .lp-badge-pulse span:first-child{animation:pulse 2s ease-in-out infinite}
        .lp-hamburger{display:none;background:none;border:none;cursor:pointer;padding:6px;color:inherit}
        .lp-hamburger svg{display:block}
        .lp-mobile-nav{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:200}
        .lp-mobile-nav-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}
        .lp-mobile-nav-panel{position:absolute;top:0;right:0;width:280px;height:100%;padding:24px;display:flex;flex-direction:column;gap:8px;animation:lpSlideIn .25s ease}
        @keyframes lpSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .lp-mobile-nav-close{align-self:flex-end;background:none;border:none;font-size:24px;cursor:pointer;padding:8px;color:inherit}
        @media(max-width:900px){.lp-grid3{grid-template-columns:1fr 1fr !important}.lp-hide-md{display:none !important}.lp-hamburger{display:flex !important}.lp-mobile-nav.open{display:block !important}.lp-footer-grid{grid-template-columns:1fr 1fr 1fr !important;gap:32px !important}}
        @media(max-width:600px){.lp-grid3{grid-template-columns:1fr !important}.lp-grid4{grid-template-columns:1fr 1fr !important;gap:24px !important}.lp-hero-h{font-size:32px !important;line-height:1.2 !important}.lp-hero-p{font-size:17px !important}.lp-section{padding:56px 20px !important}.lp-cta-row{flex-direction:column;width:100%}.lp-cta-row>*{width:100%;text-align:center;justify-content:center}.lp-footer-grid{grid-template-columns:1fr 1fr !important;gap:24px !important}.lp-stats{gap:24px !important}.lp-hero-img{max-width:100% !important;border-radius:12px !important}.lp-mobile-img{width:140px !important}}
        @media(max-width:380px){.lp-hero-h{font-size:28px !important}.lp-grid4{grid-template-columns:1fr !important}.lp-footer-grid{grid-template-columns:1fr !important;gap:20px !important}.lp-stats{gap:16px !important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)', background: dark ? 'rgba(9,9,11,.75)' : 'rgba(255,255,255,.75)', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>S</div>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -.3 }}>ShopCall</span>
          </div>

          <div className="lp-hide-md" style={{ display: 'flex', gap: 36 }}>
            {['Features','How it works','Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} className="lp-nav-link" style={{ color: c.muted, fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setDark(!dark)} className="lp-theme" style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${c.border}`, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: c.text }}>{dark ? '☀️' : '🌙'}</button>
            <Link to="/login" className="lp-hide-md" style={{ color: c.muted, fontSize: 15, fontWeight: 500, textDecoration: 'none', padding: '10px 14px' }}>Log in</Link>
            <Link to="/signup" className="lp-cta lp-hide-md" style={{ background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
            <button onClick={() => setMobileMenu(true)} className="lp-hamburger" aria-label="Open menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className={`lp-mobile-nav${mobileMenu ? ' open' : ''}`}>
        <div className="lp-mobile-nav-overlay" onClick={() => setMobileMenu(false)} />
        <div className="lp-mobile-nav-panel" style={{ background: dark ? '#111113' : '#fff' }}>
          <button className="lp-mobile-nav-close" onClick={() => setMobileMenu(false)} aria-label="Close menu">×</button>
          {['Features','How it works','Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={() => setMobileMenu(false)} style={{ color: c.text, fontSize: 16, fontWeight: 500, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>{l}</a>
          ))}
          <Link to="/login" onClick={() => setMobileMenu(false)} style={{ color: c.muted, fontSize: 16, fontWeight: 500, textDecoration: 'none', padding: '12px 0' }}>Log in</Link>
          <Link to="/signup" onClick={() => setMobileMenu(false)} style={{ background: '#6366f1', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginTop: 8 }}>Get Started</Link>
        </div>
      </div>

      {/* HERO */}
      <section className="lp-section" style={{ padding: '120px 28px 70px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="lp-enter lp-badge-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? '#1a1a2e' : '#eef2ff', borderRadius: 24, padding: '7px 18px', marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#6366f1' }}>{hero.badge}</span>
          </div>

          <h1 className="lp-enter lp-enter-d1 lp-hero-h" style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 24 }}>
            {hero.title}{' '}<span className="lp-gradient-text">{hero.titleHighlight}</span>
          </h1>

          <p className="lp-enter lp-enter-d2 lp-hero-p" style={{ fontSize: 20, color: c.muted, lineHeight: 1.7, marginBottom: 40 }}>
            {hero.subtitle}
          </p>

          <div className="lp-enter lp-enter-d3 lp-cta-row" style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <Link to="/signup" className="lp-cta lp-glow" style={{ background: '#6366f1', color: '#fff', padding: '16px 32px', borderRadius: 12, fontSize: 17, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {hero.cta} <span style={{ fontSize: 20 }}>→</span>
            </Link>
            <button onClick={() => setShowDemo(true)} className="lp-cta-ghost" style={{ padding: '16px 32px', borderRadius: 12, fontSize: 17, fontWeight: 500, border: `1px solid ${c.border}`, color: c.text, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', cursor: 'pointer' }}>
              {hero.ctaSecondary}
            </button>
          </div>

          <p className="lp-enter lp-enter-d3" style={{ fontSize: 14, color: c.muted, marginTop: 20 }}>{hero.note}</p>
        </div>

        {/* Hero Image */}
        <div className="lp-enter lp-enter-d3" style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
          <img src="/images/img1.png" alt="Live video shopping experience" loading="lazy" className="lp-hero-img" style={{ width: '100%', maxWidth: 720, borderRadius: 16, border: `1px solid ${c.border}`, boxShadow: dark ? '0 24px 64px rgba(99,102,241,.15)' : '0 24px 64px rgba(0,0,0,.08)' }} />
        </div>

        {/* Social proof strip */}
        <div className="lp-enter lp-enter-d3 lp-stats" style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 64, flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <p className="lp-counter" style={{ fontSize: 28, fontWeight: 700, color: c.text }}>{s.v}</p>
              <p style={{ fontSize: 14, color: c.muted, marginTop: 4 }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Platform logos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>
          {platforms.map(l => (
            <div key={l} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${c.border}`, fontSize: 14, color: c.muted, fontWeight: 500 }}>{l}</div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="lp-section" style={{ padding: '70px 28px 90px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', textAlign: 'center' }}>
          <p className="lp-reveal" style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Dashboard</p>
          <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 34, fontWeight: 700, letterSpacing: -.5, marginBottom: 36 }}>Everything at a glance</h2>
          <div className="lp-reveal-scale lp-reveal-d2 lp-glow" style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${c.border}` }}>
            <img src="/images/img3.png" alt="ShopCall dashboard analytics" loading="lazy" style={{ width: '100%', display: 'block', borderRadius: 16 }} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-section" style={{ padding: '100px 28px', background: dark ? '#0c0c0e' : '#fafbfc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="lp-reveal" style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Features</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 700, letterSpacing: -.5 }}>Built for selling, not just calling</h2>
          </div>
          <div className="lp-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {features.map((f, i) => (
              <div key={f.title} className={`lp-card lp-reveal lp-shimmer lp-reveal-d${Math.min(i + 1, 5)}`} style={{ background: c.card, borderRadius: 16, padding: 28, border: `1px solid ${c.border}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: dark ? '#1a1a2e' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-section" style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="lp-reveal" style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>How it works</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 700, letterSpacing: -.5 }}>Live in 4 steps</h2>
          </div>
          <div className="lp-reveal lp-reveal-d2" style={{ marginBottom: 48, display: 'flex', justifyContent: 'center' }}>
            <img src="/images/img2.png" alt="How ShopCall integration works" loading="lazy" style={{ width: '100%', maxWidth: 540, borderRadius: 16, border: `1px solid ${c.border}`, boxShadow: dark ? '0 16px 48px rgba(99,102,241,.1)' : '0 16px 48px rgba(0,0,0,.06)' }} />
          </div>
          {steps.map((step, i) => (
            <div key={i} className={`lp-reveal lp-reveal-d${i + 2}`} style={{ display: 'flex', gap: 18, marginBottom: i < steps.length - 1 ? 0 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                {i < steps.length - 1 && <div className="lp-step-line" style={{ width: 2, flex: 1, margin: '4px 0', borderRadius: 1 }} />}
              </div>
              <div style={{ paddingBottom: 36 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: 16, color: c.muted, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CODE */}
      <section className="lp-section" style={{ padding: '80px 28px', background: dark ? '#0c0c0e' : '#fafbfc', position: 'relative', overflow: 'hidden' }}>
        <img src="/images/img5.png" alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: dark ? 0.15 : 0.07, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 className="lp-reveal" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -.5 }}>This is all you need</h2>
          </div>
          <div className="lp-glow lp-reveal-scale" style={{ background: '#0d0d0f', borderRadius: 16, padding: '24px 28px', border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#555' }}>index.html</span>
            </div>
            <pre style={{ fontSize: 15, lineHeight: 1.9, color: '#ccc', whiteSpace: 'pre-wrap', fontFamily: 'SF Mono, Menlo, monospace' }}>
              <span style={{ color: '#555' }}>{'<!-- Add live shopping -->'}</span>{'\n'}
              <span style={{ color: '#c084fc' }}>{'<script '}</span>
              <span style={{ color: '#4ade80' }}>src</span>
              <span style={{ color: '#ccc' }}>=</span>
              <span style={{ color: '#fbbf24' }}>"https://cdn.shopcall.store/sdk.js"</span>{'\n'}
              {'  '}<span style={{ color: '#4ade80' }}>data-store</span>
              <span style={{ color: '#ccc' }}>=</span>
              <span style={{ color: '#fbbf24' }}>"your_key"</span>
              <span style={{ color: '#c084fc' }}>{'>'}</span>
              <span style={{ color: '#c084fc' }}>{'</script>'}</span>
            </pre>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="lp-section" style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="lp-reveal" style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Pricing</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 700, letterSpacing: -.5 }}>Start free, scale as you grow</h2>
          </div>
          <div className="lp-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {pricing.map((p, i) => (
              <div key={p.name} className={`lp-card lp-reveal lp-reveal-d${i + 1}`} style={{ background: c.card, borderRadius: 16, padding: 32, border: p.popular ? '2px solid #6366f1' : `1px solid ${c.border}`, position: 'relative' }}>
                {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: .5 }}>Most popular</div>}
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{p.name}</p>
                <p style={{ fontSize: 38, fontWeight: 800, letterSpacing: -.5 }}>{p.price}</p>
                <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>{p.sub}</p>
                <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: 15, color: c.muted, padding: '6px 0', display: 'flex', gap: 10 }}><span style={{ color: '#6366f1' }}>✓</span>{f}</li>)}
                </ul>
                <Link to="/signup" className={p.popular ? 'lp-cta' : 'lp-cta-ghost'} style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', background: p.popular ? '#6366f1' : 'transparent', color: p.popular ? '#fff' : c.text, border: p.popular ? 'none' : `1px solid ${c.border}` }}>
                  {p.popular ? 'Start now' : 'Get started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-section" style={{ padding: '120px 28px', textAlign: 'center', background: dark ? '#0c0c0e' : '#fafbfc' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div className="lp-reveal lp-float" style={{ marginBottom: 36, display: 'flex', justifyContent: 'center' }}>
            <img src="/images/img4.png" alt="ShopCall on mobile" loading="lazy" className="lp-mobile-img" style={{ width: 200, borderRadius: 22, boxShadow: dark ? '0 20px 60px rgba(99,102,241,.2)' : '0 20px 60px rgba(0,0,0,.1)' }} />
          </div>
          <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 38, fontWeight: 800, letterSpacing: -.5, marginBottom: 16 }}>{finalCta.title}</h2>
          <p className="lp-reveal lp-reveal-d2" style={{ color: c.muted, fontSize: 18, lineHeight: 1.7, marginBottom: 36 }}>{finalCta.subtitle}</p>
          <div className="lp-reveal lp-reveal-d3">
            <Link to="/signup" className="lp-cta lp-glow" style={{ background: '#6366f1', color: '#fff', padding: '18px 40px', borderRadius: 12, fontSize: 18, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {finalCta.button} <span style={{ fontSize: 22 }}>→</span>
            </Link>
            <p style={{ color: c.muted, fontSize: 13, marginTop: 16 }}>{finalCta.note}</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-section" style={{ borderTop: `1px solid ${c.border}`, padding: '64px 28px 32px', background: dark ? '#0a0a0c' : '#fafbfc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top: Brand + Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', gap: 48, marginBottom: 48 }} className="lp-footer-grid">
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>S</div>
                <span style={{ fontSize: 18, fontWeight: 700 }}>ShopCall</span>
              </div>
              <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, maxWidth: 280 }}>{footer?.tagline || ''}</p>
              {/* Socials */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {(footer?.socials || []).map(s => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.muted, textDecoration: 'none', fontSize: 13, transition: 'border-color .2s' }} title={s.platform}>
                    {s.platform === 'Twitter' ? '𝕏' : s.platform === 'LinkedIn' ? 'in' : s.platform === 'Instagram' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> : s.platform === 'YouTube' ? '▶' : s.platform[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {(footer?.columns || []).map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: c.text }}>{col.title}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {(col.links || []).map(link => (
                    <li key={link.label} style={{ marginBottom: 10 }}>
                      {link.label === 'Contact Us' ? (
                        <button onClick={() => setShowContact(true)} style={{ color: c.muted, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color .2s' }}>{link.label}</button>
                      ) : link.url?.startsWith('#') || link.url?.startsWith('http') ? (
                        <a href={link.url} target={link.url?.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ color: c.muted, fontSize: 14, textDecoration: 'none', transition: 'color .2s' }}>{link.label}</a>
                      ) : (
                        <Link to={link.url || '/'} style={{ color: c.muted, fontSize: 14, textDecoration: 'none', transition: 'color .2s' }}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: c.muted }}>{footer?.copyright || '© 2026 ShopCall'}</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/login" style={{ color: c.muted, fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/agent-login" style={{ color: c.muted, fontSize: 13, textDecoration: 'none' }}>Agent Login</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CONTACT MODAL */}
      {showContact && <Modal dark={dark} c={c} onClose={() => { setShowContact(false); setFormMsg(''); }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Contact Us</h3>
        <p style={{ fontSize: 14, color: c.muted, marginBottom: 20 }}>We'd love to hear from you. Leave your details and we'll get back to you.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const res = await fetch(`${API}/requests/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), phone: fd.get('phone') }) });
          if (res.ok) { setFormMsg('✓ Submitted! We will contact you within 24 hours.'); e.target.reset(); } else setFormMsg('Something went wrong. Try again.');
        }}>
          <input name="name" required placeholder="Your Name" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, marginBottom: 12, outline: 'none' }} />
          <input name="phone" required placeholder="Phone Number" type="tel" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, marginBottom: 16, outline: 'none' }} />
          {formMsg && <p style={{ fontSize: 13, color: formMsg.startsWith('✓') ? '#22c55e' : '#ef4444', marginBottom: 12 }}>{formMsg}</p>}
          <button type="submit" className="lp-cta" style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Submit</button>
          <p style={{ fontSize: 12, color: c.muted, marginTop: 12, textAlign: 'center' }}>Average response time is 24 hours</p>
        </form>
      </Modal>}

      {/* BOOK DEMO MODAL */}
      {showDemo && <Modal dark={dark} c={c} onClose={() => { setShowDemo(false); setFormMsg(''); }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Book a Demo</h3>
        <p style={{ fontSize: 14, color: c.muted, marginBottom: 20 }}>Schedule a personalized demo with our product expert.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const res = await fetch(`${API}/requests/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), preferredDate: fd.get('preferredDate'), preferredTime: fd.get('preferredTime') }) });
          if (res.ok) { setFormMsg('✓ Demo request submitted!'); e.target.reset(); } else setFormMsg('Something went wrong. Try again.');
        }}>
          <input name="name" required placeholder="Full Name" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, marginBottom: 12, outline: 'none' }} />
          <input name="email" required type="email" placeholder="Email Address" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, marginBottom: 12, outline: 'none' }} />
          <input name="phone" required type="tel" placeholder="Phone Number" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 15, marginBottom: 12, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input name="preferredDate" required type="date" onClick={e => e.target.showPicker()} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 14, outline: 'none', cursor: 'pointer' }} />
            <input name="preferredTime" required type="time" onClick={e => e.target.showPicker()} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.border}`, background: dark ? '#0c0c0e' : '#f9f9fb', color: c.text, fontSize: 14, outline: 'none', cursor: 'pointer' }} />
          </div>
          {formMsg && <p style={{ fontSize: 13, color: formMsg.startsWith('✓') ? '#22c55e' : '#ef4444', marginBottom: 12 }}>{formMsg}</p>}
          <button type="submit" className="lp-cta" style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Book Demo</button>
          <p style={{ fontSize: 12, color: c.muted, marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>Average response time is 12 hours</p>
        </form>
      </Modal>}
    </div>
  );
}

function Modal({ dark, c, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: dark ? '#111113' : '#fff', borderRadius: 18, padding: 32, maxWidth: 420, width: '100%', border: `1px solid ${c.border}`, boxShadow: '0 24px 64px rgba(0,0,0,.3)', animation: 'lpEnter .3s cubic-bezier(.16,1,.3,1)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: c.muted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        {children}
      </div>
    </div>
  );
}

const D = { bg: '#09090b', text: '#f4f4f5', muted: '#71717a', card: '#111113', border: '#1f1f23' };
const L = { bg: '#ffffff', text: '#18181b', muted: '#71717a', card: '#ffffff', border: '#e4e4e7' };
