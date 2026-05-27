import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function AgentLogin({ onAgentLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dark = localStorage.getItem('theme') !== 'light';
  const c = dark ? { bg: '#09090b', border: '#1f1f23', muted: '#71717a', text: '#f4f4f5' } : { bg: '#fafbfc', border: '#e4e4e7', muted: '#71717a', text: '#18181b' };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    const endpoint = mode === 'login' ? `${API}/agents/login` : `${API}/agents/set-password`;
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) onAgentLogin(data.token, data.agent); else setError(data.error);
    } catch { setError('Network error'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, transition: 'background .4s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        .auth-input{transition:border-color .2s,box-shadow .2s}
        .auth-input:focus{border-color:#6366f1 !important;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
        .auth-btn{transition:all .2s cubic-bezier(.16,1,.3,1)}
        .auth-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(99,102,241,.25)}
        .auth-fade{animation:authFade .5s cubic-bezier(.16,1,.3,1)}
        @keyframes authFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <form onSubmit={submit} className="auth-fade" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 16 }}>R</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 6 }}>Agent {mode === 'login' ? 'Sign in' : 'Setup'}</h1>
          <p style={{ fontSize: 13, color: c.muted }}>{mode === 'login' ? 'Sign in to handle customer calls' : 'Set your password to get started'}</p>
        </div>

        {error && (
          <div style={{ background: dark ? '#2d0a0a' : '#fef2f2', border: `1px solid ${dark ? '#7f1d1d' : '#fecaca'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ color: dark ? '#fca5a5' : '#dc2626', fontSize: 13 }}>{error}</p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.text, marginBottom: 6 }}>Email</label>
          <input className="auth-input" type="email" placeholder="your@email.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required
            style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14, outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.text, marginBottom: 6 }}>Password</label>
          <input className="auth-input" type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required
            style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14, outline: 'none' }} />
        </div>

        <button type="submit" disabled={loading} className="auth-btn" style={{ width: '100%', padding: 13, borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Set password & continue →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'setup' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            {mode === 'login' ? 'First time? Set your password' : 'Already set up? Sign in'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: `1px solid ${c.border}` }}>
          <Link to="/login" style={{ color: c.muted, fontSize: 12, textDecoration: 'none' }}>← Store owner login</Link>
        </div>
      </form>
    </div>
  );
}
