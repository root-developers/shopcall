import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoIcon from '../components/LogoIcon';

const D = { bg: '#09090b', text: '#f4f4f5', muted: '#71717a', card: '#111113', border: '#1f1f23' };
const L = { bg: '#ffffff', text: '#18181b', muted: '#71717a', card: '#ffffff', border: '#e4e4e7' };

export default function Layout({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const c = dark ? D : L;

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.lp-reveal,.lp-reveal-scale').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  const onHome = location.pathname === '/';

  const footer = {
    tagline: 'Live video commerce for Indian e-commerce. Help your customers see, ask, and buy — all in one call. Built for conversions, not just conversations.',
    columns: [
      { title: 'Product', links: [{ label: 'Features', url: onHome ? '#features' : '/#features' }, { label: 'Pricing', url: onHome ? '#pricing' : '/#pricing' }, { label: 'How it Works', url: onHome ? '#how-it-works' : '/#how-it-works' }] },
      { title: 'Company', links: [{ label: 'About Us', url: '/about' }, { label: 'Blog', url: '/blog' }, { label: 'Contact Us', url: '/contact' }] },
      { title: 'Legal', links: [{ label: 'Terms of Service', url: '/terms' }, { label: 'Privacy Policy', url: '/privacy' }, { label: 'Cancellation & Refund', url: '/refund' }, { label: 'Shipping Policy', url: '/shipping' }, { label: 'Grievance Redressal', url: '/grievance' }] },
    ],
    copyright: '© 2026 ShopCall Technologies Pvt. Ltd. All rights reserved. Made with ❤️ in India.',
  };

  return (
    <div style={{ background: c.bg, color: c.text, transition: 'all 0.4s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        .lp-enter{animation:lpEnter .7s cubic-bezier(.16,1,.3,1) both}
        @keyframes lpEnter{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .lp-reveal{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .lp-reveal.visible{opacity:1;transform:translateY(0)}
        .lp-card{transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s,border-color .3s}
        .lp-card:hover{transform:translateY(-8px);box-shadow:${dark ? '0 20px 40px rgba(99,102,241,.12)' : '0 20px 40px rgba(0,0,0,.08)'};border-color:#6366f1 !important}
        .lp-cta{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .lp-cta:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(99,102,241,.35)}
        .lp-cta-ghost{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .lp-cta-ghost:hover{background:${dark ? '#1a1a2e' : '#f0f0ff'} !important;border-color:#6366f1 !important;transform:translateY(-3px)}
        .lp-nav-link{position:relative}
        .lp-nav-link::after{content:'';position:absolute;bottom:-4px;left:50%;width:0;height:2px;background:#6366f1;border-radius:1px;transition:width .3s,left .3s}
        .lp-nav-link:hover::after{width:100%;left:0}
        .lp-nav-link:hover{color:${dark ? '#f4f4f5' : '#18181b'} !important}
        @media(max-width:900px){.lp-footer-grid{grid-template-columns:1fr 1fr 1fr !important;gap:32px !important}}
        @media(max-width:600px){.lp-footer-grid{grid-template-columns:1fr 1fr !important;gap:24px !important}}
        @media(max-width:380px){.lp-footer-grid{grid-template-columns:1fr !important;gap:20px !important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)', background: dark ? 'rgba(9,9,11,.75)' : 'rgba(255,255,255,.75)', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
            <LogoIcon size={34} />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -.3 }}>ShopCall</span>
          </Link>

          <div style={{ display: 'flex', gap: 36 }}>
            {['Features','How it works','Pricing'].map(l => {
              const url = onHome ? `#${l.toLowerCase().replace(/ /g,'-')}` : `/#${l.toLowerCase().replace(/ /g,'-')}`;
              return (
                <a key={l} href={url} className="lp-nav-link lp-hide-md" style={{ color: c.muted, fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}>{l}</a>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setDark(!dark)} className="lp-theme" style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${c.border}`, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: c.text }}>{dark ? '☀️' : '🌙'}</button>
            <Link to="/login" style={{ color: c.text, border: `1px solid ${c.border}`, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 16px', borderRadius: 8, background: c.card }}>Log in</Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {React.cloneElement(children, { dark, c })}
      </main>

      {/* FOOTER */}
      <footer style={{ padding: '80px 28px 40px', background: dark ? '#09090b' : '#fafbfc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', gap: 48, marginBottom: 60 }} className="lp-footer-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LogoIcon size={34} />
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -.3 }}>ShopCall</span>
              </div>
              <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.6, maxWidth: 300 }}>{footer.tagline}</p>
            </div>

            {footer.columns.map((col, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map((link, lidx) => (
                    <li key={lidx}>
                      {link.url.startsWith('#') || link.url.startsWith('/#') ? (
                        <a href={link.url} style={{ color: c.muted, fontSize: 14, textDecoration: 'none', transition: 'color .2s' }}>{link.label}</a>
                      ) : (
                        <Link to={link.url} style={{ color: c.muted, fontSize: 14, textDecoration: 'none', transition: 'color .2s' }}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: c.muted }}>{footer.copyright}</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/login" style={{ color: c.muted, fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/agent-login" style={{ color: c.muted, fontSize: 13, textDecoration: 'none' }}>Agent Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
