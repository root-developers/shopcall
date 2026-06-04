import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import LogoIcon from '../components/LogoIcon';

export default function Signup({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', storeUrl: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dark = localStorage.getItem('theme') !== 'light';
  const c = dark ? { bg: '#09090b', card: '#111113', border: '#1f1f23', muted: '#71717a', text: '#f4f4f5' } : { bg: '#fafbfc', card: '#ffffff', border: '#e4e4e7', muted: '#71717a', text: '#18181b' };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
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
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.1) 0%, transparent 70%)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <LogoIcon size={32} />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>ShopCall</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 16 }}>Start selling live in<br />under 2 minutes</h2>
          <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.7, maxWidth: 320 }}>Position your store in India's fastest-growing live commerce market and convert 3x more visitors into buyers.</p>
          
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['No credit card required', '5 free customer calls', 'Works with any website'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a2e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#22c55e', fontSize: 11 }}>✓</span>
                </div>
                <span style={{ fontSize: 13, color: '#a1a1aa' }}>{t}</span>
              </div>
            ))}
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
            <h1 style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 8 }}>Create your account</h1>
            <p style={{ fontSize: 14, color: c.muted }}>Get your SDK key and start selling live</p>
          </div>

          {error && (
            <div style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: '#fca5a5', fontSize: 13 }}>{error}</p>
            </div>
          )}

          {[
            { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@store.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { key: 'storeName', label: 'Store name', type: 'text', placeholder: 'My Awesome Store' },
            { key: 'storeUrl', label: 'Store URL', type: 'text', placeholder: 'https://mystore.com (optional)', required: false },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.text, marginBottom: 6 }}>{f.label}</label>
              <input className="auth-input" type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })} required={f.required !== false}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14, outline: 'none' }} />
            </div>
          ))}

          <button type="submit" disabled={loading} className="auth-btn" style={{ width: '100%', padding: 13, borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', marginTop: 8, opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account...' : 'Create account →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: c.muted }}>
            Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
