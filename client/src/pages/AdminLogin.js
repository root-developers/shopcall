import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import LogoIcon from '../components/LogoIcon';

export default function AdminLogin({ onAdminLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) onAdminLogin(data.token);
      else setError(data.error);
    } catch { setError('Network error'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <style>{`
        .admin-back-btn { transition: all .2s cubic-bezier(.16,1,.3,1); }
        .admin-back-btn:hover { border-color: #ef4444 !important; color: #ef4444 !important; background: rgba(239, 68, 68, 0.08) !important; transform: translateX(-2px); }
        @media(max-width: 480px) { .admin-back-btn { top: 12px !important; left: 12px !important; } }
      `}</style>

      <Link to="/" style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: '#71717a', fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.03)', padding: '8px 14px', borderRadius: 8, border: '1px solid #1f1f23', transition: 'all 0.2s' }} className="admin-back-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Home
      </Link>

      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LogoIcon size={40} style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5' }}>Super Admin</h1>
          <p style={{ fontSize: 13, color: '#71717a' }}>Platform management console</p>
        </div>
        {error && <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
          style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
          style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading ? .6 : 1 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
