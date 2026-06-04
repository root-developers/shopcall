import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import LogoIcon from '../components/LogoIcon';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dark = localStorage.getItem('theme') !== 'light';
  const c = dark ? { bg: '#09090b', card: '#111113', border: '#1f1f23', muted: '#71717a', text: '#f4f4f5' } : { bg: '#fafbfc', card: '#ffffff', border: '#e4e4e7', muted: '#71717a', text: '#18181b' };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) onLogin(data.token, data.user); else setError(data.error);
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', transition: 'background .4s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        .auth-input{transition:border-color .2s,box-shadow .2s}
        .auth-input:focus{border-color:#6366f1 !important;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
        .auth-btn{transition:all .2s cubic-bezier(.16,1,.3,1)}
        .auth-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(99,102,241,.25)}
        .auth-btn:active:not(:disabled){transform:translateY(0)}
        .auth-back-btn{transition:all .2s cubic-bezier(.16,1,.3,1)}
        .auth-back-btn:hover{border-color:#6366f1 !important;color:#6366f1 !important;background:${dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)'} !important;transform:translateX(-2px)}
        .auth-fade{animation:authFade .5s cubic-bezier(.16,1,.3,1)}
        @keyframes authFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:900px){.auth-side{display:none !important}}
        @media(max-width:480px){.auth-form-wrap{padding:24px !important}.auth-back-btn{top:12px !important;left:12px !important}}
      `}</style>

      {/* Left side - branding */}
      <div className="auth-side" style={{ flex: 1, background: 'linear-gradient(135deg, #09090b 0%, #1a1a2e 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 60, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', right: '-15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 70%)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <LogoIcon size={32} />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>ShopCall</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 16 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.7, maxWidth: 300 }}>Sign in to manage your live commerce dashboard, view analytics, and handle customer calls.</p>
          
          <div style={{ marginTop: 48, padding: 20, background: 'rgba(255,255,255,.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,.06)' }}>
            <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6 }}>"ShopCall increased our average order value by 40%. Customers love the personal touch of live video."</p>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>P</div>
              <div>
                <p style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>Priya Sharma</p>
                <p style={{ fontSize: 11, color: '#71717a' }}>Saree Bazaar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        <Link to="/" style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: c.muted, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '8px 14px', borderRadius: 8, border: `1px solid ${c.border}`, transition: 'all 0.2s' }} className="auth-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Home
        </Link>
        <form onSubmit={submit} className="auth-fade auth-form-wrap" style={{ width: '100%', maxWidth: 380, padding: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 8 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: c.muted }}>Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div style={{ background: dark ? '#2d0a0a' : '#fef2f2', border: `1px solid ${dark ? '#7f1d1d' : '#fecaca'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: dark ? '#fca5a5' : '#dc2626', fontSize: 13 }}>{error}</p>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.text, marginBottom: 6 }}>Email</label>
            <input className="auth-input" type="email" placeholder="you@store.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14, outline: 'none' }} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.text, marginBottom: 6 }}>Password</label>
            <input className="auth-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14, outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} className="auth-btn" style={{ width: '100%', padding: 13, borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', marginTop: 20, opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: c.muted }}>
              Don't have an account? <Link to="/signup" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>Create one</Link>
            </p>
            <p style={{ fontSize: 12, color: c.muted, marginTop: 12 }}>
              <Link to="/agent-login" style={{ color: c.muted, textDecoration: 'none', borderBottom: `1px solid ${c.border}` }}>Agent login →</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
