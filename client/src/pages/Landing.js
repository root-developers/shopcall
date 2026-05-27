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
  hero: { badge: 'Now in public beta', title: 'Turn your website into a', titleHighlight: 'live showroom', subtitle: 'One script tag adds a "Live Shop" button to your store. Customers click, you connect via video, show products, and close the deal — all without them leaving your site.', cta: 'Start free', ctaSecondary: 'Watch demo', note: 'Free forever for 5 calls · No credit card' },
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
};

export default function Landing() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [content, setContent] = useState(DEFAULT_CONTENT);
  useEffect(() => { localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    document.title = 'ShopCall - Live Video Shopping for E-commerce | Add Live Shop Button';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Add a Live Shop video call button to your e-commerce store with 2 lines of code. Connect with customers via HD video, show products live, and close sales 3x faster.');
    fetch(`${API}/site`).then(r => r.json()).then(d => { if (d && d.hero) setContent(d); }).catch(() => {});
  }, []);
  const c = dark ? D : L;
  const { hero, stats, platforms, features, steps, pricing, finalCta } = content;

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
        .lp-card{transition:transform .25s cubic-bezier(.16,1,.3,1),box-shadow .25s}
        .lp-card:hover{transform:translateY(-6px)}
        .lp-cta{transition:all .2s cubic-bezier(.16,1,.3,1)}
        .lp-cta:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(99,102,241,.3)}
        .lp-cta-ghost{transition:all .2s}
        .lp-cta-ghost:hover{background:${dark?'#1a1a2e':'#f0f0ff'} !important}
        .lp-theme{transition:transform .4s cubic-bezier(.16,1,.3,1)}
        .lp-theme:hover{transform:scale(1.15)}
        .lp-theme:active{transform:scale(.9)}
        .lp-glow{position:relative;overflow:visible}
        .lp-glow::after{content:'';position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,#6366f1,#8b5cf6);opacity:.15;filter:blur(20px);z-index:-1;transition:opacity .3s}
        .lp-glow:hover::after{opacity:.3}
        @media(max-width:900px){.lp-grid3{grid-template-columns:1fr 1fr !important}.lp-hide-md{display:none !important}}
        @media(max-width:600px){.lp-grid3{grid-template-columns:1fr !important}.lp-grid4{grid-template-columns:1fr 1fr !important}.lp-hero-h{font-size:28px !important;line-height:1.2 !important}.lp-hero-p{font-size:15px !important}.lp-section{padding:48px 16px !important}.lp-cta-row{flex-direction:column;width:100%}.lp-cta-row>*{width:100%;text-align:center;justify-content:center}}
        @media(max-width:380px){.lp-hero-h{font-size:24px !important}.lp-grid4{grid-template-columns:1fr !important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)', background: dark ? 'rgba(9,9,11,.75)' : 'rgba(255,255,255,.75)', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>S</div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -.3 }}>ShopCall</span>
          </div>

          <div className="lp-hide-md" style={{ display: 'flex', gap: 32 }}>
            {['Features','How it works','Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ color: c.muted, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setDark(!dark)} className="lp-theme" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${c.border}`, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', color: c.text }}>{dark ? '☀️' : '🌙'}</button>
            <Link to="/login" className="lp-hide-md" style={{ color: c.muted, fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '8px 12px' }}>Log in</Link>
            <Link to="/signup" className="lp-cta" style={{ background: '#6366f1', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-section" style={{ padding: '100px 24px 60px', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="lp-enter" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: dark ? '#1a1a2e' : '#eef2ff', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#6366f1' }}>{hero.badge}</span>
          </div>

          <h1 className="lp-enter lp-enter-d1 lp-hero-h" style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 20 }}>
            {hero.title}{' '}<span style={{ color: '#6366f1' }}>{hero.titleHighlight}</span>
          </h1>

          <p className="lp-enter lp-enter-d2 lp-hero-p" style={{ fontSize: 17, color: c.muted, lineHeight: 1.7, marginBottom: 36 }}>
            {hero.subtitle}
          </p>

          <div className="lp-enter lp-enter-d3 lp-cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/signup" className="lp-cta lp-glow" style={{ background: '#6366f1', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {hero.cta} <span style={{ fontSize: 18 }}>→</span>
            </Link>
            <a href="#how-it-works" className="lp-cta-ghost" style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: 'none', border: `1px solid ${c.border}`, color: c.text, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {hero.ctaSecondary}
            </a>
          </div>

          <p className="lp-enter lp-enter-d3" style={{ fontSize: 12, color: c.muted, marginTop: 16 }}>{hero.note}</p>
        </div>

        {/* Social proof strip */}
        <div className="lp-enter lp-enter-d3" style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 56, flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: c.text }}>{s.v}</p>
              <p style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Platform logos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 40, flexWrap: 'wrap' }}>
          {platforms.map(l => (
            <div key={l} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${c.border}`, fontSize: 12, color: c.muted, fontWeight: 500 }}>{l}</div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-section" style={{ padding: '80px 24px', background: dark ? '#0c0c0e' : '#fafbfc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Features</p>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -.5 }}>Built for selling, not just calling</h2>
          </div>
          <div className="lp-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {features.map(f => (
              <div key={f.title} className="lp-card" style={{ background: c.card, borderRadius: 14, padding: 24, border: `1px solid ${c.border}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: dark ? '#1a1a2e' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-section" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>How it works</p>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -.5 }}>Live in 4 steps</h2>
          </div>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i < steps.length - 1 ? 0 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                {i < steps.length - 1 && <div style={{ width: 1, flex: 1, background: c.border, margin: '4px 0' }} />}
              </div>
              <div style={{ paddingBottom: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CODE */}
      <section className="lp-section" style={{ padding: '60px 24px', background: dark ? '#0c0c0e' : '#fafbfc' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -.5 }}>This is all you need</h2>
          </div>
          <div className="lp-glow" style={{ background: '#0d0d0f', borderRadius: 14, padding: '20px 24px', border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#555' }}>index.html</span>
            </div>
            <pre style={{ fontSize: 13, lineHeight: 1.8, color: '#ccc', whiteSpace: 'pre-wrap', fontFamily: 'SF Mono, Menlo, monospace' }}>
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
      <section id="pricing" className="lp-section" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Pricing</p>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -.5 }}>Start free, scale as you grow</h2>
          </div>
          <div className="lp-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {pricing.map(p => (
              <div key={p.name} className="lp-card" style={{ background: c.card, borderRadius: 14, padding: 28, border: p.popular ? '2px solid #6366f1' : `1px solid ${c.border}`, position: 'relative' }}>
                {p.popular && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: .5 }}>Most popular</div>}
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</p>
                <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: -.5 }}>{p.price}</p>
                <p style={{ fontSize: 12, color: c.muted, marginBottom: 20 }}>{p.sub}</p>
                <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: 13, color: c.muted, padding: '5px 0', display: 'flex', gap: 8 }}><span style={{ color: '#6366f1' }}>✓</span>{f}</li>)}
                </ul>
                <Link to="/signup" className={p.popular ? 'lp-cta' : 'lp-cta-ghost'} style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: p.popular ? '#6366f1' : 'transparent', color: p.popular ? '#fff' : c.text, border: p.popular ? 'none' : `1px solid ${c.border}` }}>
                  {p.popular ? 'Start now' : 'Get started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-section" style={{ padding: '100px 24px', textAlign: 'center', background: dark ? '#0c0c0e' : '#fafbfc' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -.5, marginBottom: 14 }}>{finalCta.title}</h2>
          <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>{finalCta.subtitle}</p>
          <Link to="/signup" className="lp-cta lp-glow" style={{ background: '#6366f1', color: '#fff', padding: '16px 36px', borderRadius: 10, fontSize: 16, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {finalCta.button} <span style={{ fontSize: 20 }}>→</span>
          </Link>
          <p style={{ color: c.muted, fontSize: 11, marginTop: 14 }}>{finalCta.note}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>S</div>
            <span style={{ fontSize: 13, color: c.muted }}>© 2026 ShopCall</span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[['Features','#features'],['Pricing','#pricing'],['Dashboard','/login'],['Agent Login','/agent-login']].map(([l,h]) => (
              h.startsWith('#') ?
                <a key={l} href={h} style={{ color: c.muted, fontSize: 12, textDecoration: 'none' }}>{l}</a> :
                <Link key={l} to={h} style={{ color: c.muted, fontSize: 12, textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const D = { bg: '#09090b', text: '#f4f4f5', muted: '#71717a', card: '#111113', border: '#1f1f23' };
const L = { bg: '#ffffff', text: '#18181b', muted: '#71717a', card: '#ffffff', border: '#e4e4e7' };
