import React, { useState } from 'react';
import { API } from '../App';

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
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 16 }}>⚡</div>
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
