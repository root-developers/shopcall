import React, { useState, useEffect } from 'react';
import { API } from '../App';

export default function AdminPanel({ token, onLogout }) {
  const [page, setPage] = useState('overview');
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/admin/stats`, { headers: h }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/admin/stores`, { headers: h }).then(r => r.json()).then(setStores).catch(() => {});
  }, [token]);

  const updateStore = async (id, data) => {
    await fetch(`${API}/admin/stores/${id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const res = await fetch(`${API}/admin/stores`, { headers: h });
    setStores(await res.json());
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', fontFamily: "'Inter',sans-serif", display: 'flex' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}.adm-nav{transition:all .15s}.adm-nav:hover{background:#18181b !important}`}</style>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0c0c0e', borderRight: '1px solid #1f1f23', padding: '20px 8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>⚡</div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Admin Panel</span>
          </div>
        </div>
        {[{ id: 'overview', label: 'Overview', icon: '◎' }, { id: 'stores', label: 'Stores', icon: '◈' }, { id: 'billing', label: 'Billing', icon: '◇' }, { id: 'site', label: 'Site Content', icon: '✎' }].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} className="adm-nav"
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 'none', borderRadius: 7, background: page === n.id ? '#1f1f23' : 'transparent', color: page === n.id ? '#f4f4f5' : '#71717a', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
            <span>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={onLogout} className="adm-nav" style={{ width: '100%', padding: '8px 12px', border: '1px solid #1f1f23', borderRadius: 7, background: 'transparent', color: '#71717a', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {/* OVERVIEW */}
        {page === 'overview' && stats && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Stores', val: stats.totalStores, color: '#6366f1' },
                { label: 'Total Agents', val: stats.totalAgents, color: '#a78bfa' },
                { label: 'Total Calls', val: stats.totalCalls, color: '#f4f4f5' },
                { label: 'Connected', val: stats.connectedCalls, color: '#22c55e' },
                { label: 'Missed', val: stats.missedCalls, color: '#ef4444' },
                { label: 'Rejected', val: stats.rejectedCalls, color: '#f59e0b' },
                { label: 'Total Minutes', val: stats.totalMinutes, color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} style={{ background: '#111113', borderRadius: 10, padding: 16, border: '1px solid #1f1f23' }}>
                  <p style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#111113', borderRadius: 10, padding: 16, border: '1px solid #1f1f23' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Recent Signups</h3>
              {stats.recentStores?.map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #18181b' }}>
                  <div>
                    <p style={{ fontSize: 13 }}>{s.storeName}</p>
                    <p style={{ fontSize: 11, color: '#52525b' }}>{s.email}</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#6366f1' }}>{s.plan}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STORES */}
        {page === 'stores' && (
          <StoresPage stores={stores} updateStore={updateStore} />
        )}

        {/* BILLING */}
        {page === 'billing' && (
          <BillingAdmin token={token} stores={stores} />
        )}

        {/* SITE CONTENT */}
        {page === 'site' && (
          <SiteEditor token={token} />
        )}
      </main>
    </div>
  );
}

function StoresPage({ stores, updateStore }) {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = stores.filter(s => {
    const matchSearch = !search || s.storeName?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'all' || s.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  const planColor = (p) => p === 'pro' ? '#a78bfa' : p === 'starter' ? '#6366f1' : '#71717a';
  const planBg = (p) => p === 'pro' ? 'rgba(167,139,250,.1)' : p === 'starter' ? 'rgba(99,102,241,.1)' : 'rgba(113,113,122,.1)';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Stores</h2>
          <p style={{ fontSize: 12, color: '#52525b', marginTop: 2 }}>{stores.length} registered · {stores.filter(s => s.plan !== 'trial').length} paid</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stores..."
            style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 12, width: 180, outline: 'none' }} />
          <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 12 }}>
            <option value="all">All Plans</option>
            <option value="trial">Trial</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total', val: stores.length, color: '#f4f4f5' },
          { label: 'Trial', val: stores.filter(s => s.plan === 'trial').length, color: '#71717a' },
          { label: 'Starter', val: stores.filter(s => s.plan === 'starter').length, color: '#6366f1' },
          { label: 'Pro', val: stores.filter(s => s.plan === 'pro').length, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111113', borderRadius: 8, padding: '12px 14px', border: '1px solid #1f1f23' }}>
            <p style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Store list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#52525b', fontSize: 13, padding: 32 }}>No stores found</p>}
        {filtered.map(s => (
          <div key={s._id} style={{ background: '#111113', borderRadius: 10, border: expanded === s._id ? '1px solid #6366f1' : '1px solid #1f1f23', overflow: 'hidden', transition: 'border-color .2s' }}>
            {/* Row */}
            <div onClick={() => setExpanded(expanded === s._id ? null : s._id)} style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', cursor: 'pointer', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#1f1f23,#27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                {s.storeName?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.storeName}</p>
                <p style={{ fontSize: 11, color: '#52525b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: planColor(s.plan), background: planBg(s.plan), padding: '3px 10px', borderRadius: 5, textTransform: 'capitalize' }}>{s.plan}</span>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#71717a' }}>
                <span title="Calls">{s.totalCalls || 0} calls</span>
                <span title="Minutes">{s.totalMinutes || 0}m</span>
                <span title="Agents">{s.agentCount || 0} agents</span>
              </div>
              <span style={{ fontSize: 14, color: '#52525b', transition: 'transform .2s', transform: expanded === s._id ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
            </div>

            {/* Expanded details */}
            {expanded === s._id && (
              <div style={{ padding: '0 18px 16px', borderTop: '1px solid #1f1f23' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, padding: '14px 0' }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#52525b', marginBottom: 4 }}>PLAN</p>
                    <select value={s.plan} onChange={e => updateStore(s._id, { plan: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 12 }}>
                      <option value="trial">Trial</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#52525b', marginBottom: 4 }}>CALL LIMIT</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input type="number" defaultValue={s.trialLimit} onBlur={e => { if (Number(e.target.value) !== s.trialLimit) updateStore(s._id, { trialLimit: Number(e.target.value) }); }}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 12, outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#52525b', marginBottom: 4 }}>USAGE</p>
                    <div style={{ background: '#09090b', borderRadius: 6, padding: '7px 10px', border: '1px solid #1f1f23' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>{s.trialCustomersUsed || 0} / {s.trialLimit}</span>
                        <span style={{ color: '#52525b' }}>{s.trialLimit > 0 ? Math.round(((s.trialCustomersUsed || 0) / s.trialLimit) * 100) : 0}%</span>
                      </div>
                      <div style={{ height: 3, background: '#1f1f23', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: (s.trialCustomersUsed || 0) >= s.trialLimit ? '#ef4444' : '#6366f1', width: `${Math.min(100, s.trialLimit > 0 ? ((s.trialCustomersUsed || 0) / s.trialLimit) * 100 : 0)}%`, borderRadius: 2, transition: 'width .3s' }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#52525b', marginBottom: 4 }}>SDK KEY</p>
                    <p style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', background: '#09090b', borderRadius: 6, padding: '8px 10px', border: '1px solid #1f1f23', wordBreak: 'break-all' }}>{s.sdkKey}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#52525b', paddingTop: 8, borderTop: '1px solid #18181b' }}>
                  <span>Connected: <strong style={{ color: '#22c55e' }}>{s.connectedCalls || 0}</strong></span>
                  <span>Missed: <strong style={{ color: '#ef4444' }}>{s.missedCalls || 0}</strong></span>
                  <span>Store URL: <a href={s.storeUrl} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>{s.storeUrl || '—'}</a></span>
                  {s.createdAt && <span style={{ marginLeft: 'auto' }}>Joined: {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingAdmin({ token, stores }) {
  const [bills, setBills] = useState([]);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/admin/billing`, { headers: h }).then(r => r.json()).then(setBills).catch(() => {});
  }, []);

  const action = async (id, type) => {
    await fetch(`${API}/admin/billing/${id}/${type}`, { method: 'POST', headers: h });
    const res = await fetch(`${API}/admin/billing`, { headers: h });
    setBills(await res.json());
  };

  const pending = bills.filter(b => b.status === 'pending');
  const history = bills.filter(b => b.status !== 'pending');

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Billing Management</h2>

      {pending.length > 0 && (
        <div style={{ background: '#111113', borderRadius: 10, border: '1px solid #f59e0b', padding: 16, marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 12 }}>Pending Approvals ({pending.length})</h3>
          {pending.map(b => (
            <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f1f23' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{b.storeName} → <span style={{ color: '#6366f1' }}>{b.plan}</span></p>
                <p style={{ fontSize: 11, color: '#52525b' }}>{b.storeEmail} · ₹{b.amount} · {new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => action(b._id, 'approve')} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                <button onClick={() => action(b._id, 'reject')} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#111113', borderRadius: 10, border: '1px solid #1f1f23', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f1f23' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600 }}>All Transactions</h3>
        </div>
        {bills.length === 0 ? <p style={{ padding: 24, textAlign: 'center', color: '#52525b', fontSize: 12 }}>No billing records</p> : (
          bills.map(b => (
            <div key={b._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid #18181b', fontSize: 12, alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500 }}>{b.storeName || 'Unknown'}</p>
                <p style={{ fontSize: 10, color: '#52525b' }}>{b.note}</p>
              </div>
              <span>{b.plan}</span>
              <span>₹{b.amount}</span>
              <span style={{ color: b.status === 'paid' ? '#22c55e' : b.status === 'failed' ? '#ef4444' : '#f59e0b' }}>{b.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SiteEditor({ token }) {
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('hero');
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch(`${API}/site`).then(r => r.json()).then(setContent).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await fetch(`${API}/site`, { method: 'PUT', headers: h, body: JSON.stringify(content) });
      if (res.ok) setMsg('✓ Saved!');
      else setMsg('Error saving');
    } catch { setMsg('Error saving'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const updateHero = (key, val) => setContent({ ...content, hero: { ...content.hero, [key]: val } });
  const updateFinalCta = (key, val) => setContent({ ...content, finalCta: { ...content.finalCta, [key]: val } });
  const updateFeature = (i, key, val) => { const f = [...content.features]; f[i] = { ...f[i], [key]: val }; setContent({ ...content, features: f }); };
  const updateStep = (i, key, val) => { const s = [...content.steps]; s[i] = { ...s[i], [key]: val }; setContent({ ...content, steps: s }); };
  const updatePricing = (i, key, val) => { const p = [...content.pricing]; p[i] = { ...p[i], [key]: val }; setContent({ ...content, pricing: p }); };
  const updatePricingFeature = (pi, fi, val) => { const p = [...content.pricing]; const f = [...p[pi].features]; f[fi] = val; p[pi] = { ...p[pi], features: f }; setContent({ ...content, pricing: p }); };
  const updateStat = (i, key, val) => { const s = [...content.stats]; s[i] = { ...s[i], [key]: val }; setContent({ ...content, stats: s }); };

  const addFeature = () => setContent({ ...content, features: [...content.features, { icon: '✨', title: 'New Feature', desc: 'Description' }] });
  const removeFeature = (i) => setContent({ ...content, features: content.features.filter((_, idx) => idx !== i) });
  const addStep = () => setContent({ ...content, steps: [...content.steps, { title: 'New Step', desc: 'Description' }] });
  const removeStep = (i) => setContent({ ...content, steps: content.steps.filter((_, idx) => idx !== i) });
  const addPricingFeature = (pi) => { const p = [...content.pricing]; p[pi] = { ...p[pi], features: [...p[pi].features, 'New feature'] }; setContent({ ...content, pricing: p }); };
  const removePricingFeature = (pi, fi) => { const p = [...content.pricing]; p[pi] = { ...p[pi], features: p[pi].features.filter((_, idx) => idx !== fi) }; setContent({ ...content, pricing: p }); };

  if (!content) return <p style={{ color: '#52525b' }}>Loading...</p>;

  const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 12, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, color: '#71717a', marginBottom: 4, fontWeight: 500 };
  const cardStyle = { background: '#111113', borderRadius: 10, border: '1px solid #1f1f23', padding: 16, marginBottom: 12 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Site Content (Landing Page)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {msg && <span style={{ fontSize: 12, color: '#22c55e' }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: saving ? .5 : 1 }}>{saving ? 'Saving...' : 'Save All'}</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {['hero', 'stats', 'features', 'steps', 'pricing', 'finalCta'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: tab === t ? '#6366f1' : '#1f1f23', color: tab === t ? '#fff' : '#71717a', fontSize: 11, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'finalCta' ? 'Final CTA' : t}</button>
        ))}
      </div>

      {/* HERO */}
      {tab === 'hero' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Hero Section</h3>
          {[['badge', 'Badge Text'], ['title', 'Title (before highlight)'], ['titleHighlight', 'Title Highlight (colored)'], ['subtitle', 'Subtitle'], ['cta', 'CTA Button Text'], ['ctaSecondary', 'Secondary CTA'], ['note', 'Note (below buttons)']].map(([key, label]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={labelStyle}>{label}</label>
              {key === 'subtitle' ? (
                <textarea value={content.hero[key]} onChange={e => updateHero(key, e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
              ) : (
                <input value={content.hero[key]} onChange={e => updateHero(key, e.target.value)} style={inputStyle} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* STATS */}
      {tab === 'stats' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Stats Strip</h3>
          {content.stats.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Value</label>
                <input value={s.v} onChange={e => updateStat(i, 'v', e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Label</label>
                <input value={s.l} onChange={e => updateStat(i, 'l', e.target.value)} style={inputStyle} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FEATURES */}
      {tab === 'features' && (
        <div>
          {content.features.map((f, i) => (
            <div key={i} style={{ ...cardStyle, position: 'relative' }}>
              <button onClick={() => removeFeature(i)} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={labelStyle}>Icon</label>
                  <input value={f.icon} onChange={e => updateFeature(i, 'icon', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input value={f.title} onChange={e => updateFeature(i, 'title', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <label style={labelStyle}>Description</label>
              <input value={f.desc} onChange={e => updateFeature(i, 'desc', e.target.value)} style={inputStyle} />
            </div>
          ))}
          <button onClick={addFeature} style={{ background: '#1f1f23', color: '#a1a1aa', border: '1px dashed #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%' }}>+ Add Feature</button>
        </div>
      )}

      {/* STEPS */}
      {tab === 'steps' && (
        <div>
          {content.steps.map((s, i) => (
            <div key={i} style={{ ...cardStyle, position: 'relative' }}>
              <button onClick={() => removeStep(i)} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Title</label>
                  <input value={s.title} onChange={e => updateStep(i, 'title', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <label style={labelStyle}>Description</label>
              <input value={s.desc} onChange={e => updateStep(i, 'desc', e.target.value)} style={inputStyle} />
            </div>
          ))}
          <button onClick={addStep} style={{ background: '#1f1f23', color: '#a1a1aa', border: '1px dashed #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%' }}>+ Add Step</button>
        </div>
      )}

      {/* PRICING */}
      {tab === 'pricing' && (
        <div>
          {content.pricing.map((p, pi) => (
            <div key={pi} style={{ ...cardStyle, borderColor: p.popular ? '#6366f1' : '#1f1f23' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{p.name || `Plan ${pi + 1}`}</h4>
                <label style={{ fontSize: 11, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={p.popular || false} onChange={e => updatePricing(pi, 'popular', e.target.checked)} /> Popular
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={labelStyle}>Name</label><input value={p.name} onChange={e => updatePricing(pi, 'name', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Price</label><input value={p.price} onChange={e => updatePricing(pi, 'price', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtitle</label><input value={p.sub} onChange={e => updatePricing(pi, 'sub', e.target.value)} style={inputStyle} /></div>
              </div>
              <label style={labelStyle}>Features</label>
              {p.features.map((f, fi) => (
                <div key={fi} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  <input value={f} onChange={e => updatePricingFeature(pi, fi, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => removePricingFeature(pi, fi)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '0 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
                </div>
              ))}
              <button onClick={() => addPricingFeature(pi)} style={{ background: 'transparent', color: '#6366f1', border: 'none', fontSize: 11, cursor: 'pointer', marginTop: 4 }}>+ Add feature</button>
            </div>
          ))}
        </div>
      )}

      {/* FINAL CTA */}
      {tab === 'finalCta' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Final CTA Section</h3>
          {[['title', 'Title'], ['subtitle', 'Subtitle'], ['button', 'Button Text'], ['note', 'Note']].map(([key, label]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={labelStyle}>{label}</label>
              <input value={content.finalCta[key]} onChange={e => updateFinalCta(key, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
