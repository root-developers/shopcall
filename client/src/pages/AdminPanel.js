import React, { useState, useEffect } from 'react';
import { API } from '../App';
import LogoIcon from '../components/LogoIcon';

const ADM_NAV = [
  { id: 'overview', label: 'Overview', icon: '◎' },
  { id: 'stores', label: 'Stores', icon: '◈' },
  { id: 'billing', label: 'Billing', icon: '◇' },
  { id: 'requests', label: 'Requests', icon: '✉' },
  { id: 'leads', label: 'Leads', icon: '◆' },
  { id: 'tested_leads', label: 'Live Tested Leads', icon: '⚡' },
  { id: 'site', label: 'Site Content', icon: '✎' },
];

export default function AdminPanel({ token, onLogout }) {
  const [page, setPage] = useState('overview');
  const [sidebar, setSidebar] = useState(false);
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b', color: '#f4f4f5', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes admFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .adm-fade{animation:admFadeUp .4s cubic-bezier(.16,1,.3,1)}
        .adm-nav{transition:all .15s}.adm-nav:hover{background:#18181b !important}
        @media(min-width:769px){.adm-sidebar{position:relative !important;left:0 !important}.adm-hamburger{display:none !important}}
        @media(max-width:768px){.adm-sidebar{position:fixed !important}.adm-content{padding:16px !important}}
      `}</style>

      {sidebar && <div onClick={() => setSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />}

      {/* Sidebar */}
      <aside className="adm-sidebar" style={{ width: 220, background: '#0c0c0e', borderRight: '1px solid #1f1f23', padding: '20px 8px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: sidebar ? 0 : -220, zIndex: 50, transition: 'left .25s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ padding: '0 12px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogoIcon size={26} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Admin Panel</span>
          </div>
        </div>
        {ADM_NAV.map(n => (
          <button key={n.id} onClick={() => { setPage(n.id); setSidebar(false); }} className="adm-nav"
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 'none', borderRadius: 7, background: page === n.id ? '#1f1f23' : 'transparent', color: page === n.id ? '#f4f4f5' : '#71717a', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
            <span style={{ fontSize: 14, opacity: page === n.id ? 1 : .6 }}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={onLogout} className="adm-nav" style={{ width: '100%', padding: '8px 12px', border: '1px solid #1f1f23', borderRadius: 7, background: 'transparent', color: '#71717a', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #1f1f23', position: 'sticky', top: 0, background: '#09090b', zIndex: 30 }}>
          <button className="adm-hamburger" onClick={() => setSidebar(true)} style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: 6, color: '#f4f4f5', fontSize: 16, cursor: 'pointer', padding: '5px 9px', lineHeight: 1 }}>☰</button>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: -.2 }}>{ADM_NAV.find(n => n.id === page)?.label}</h2>
        </header>

        <div className="adm-content adm-fade" style={{ padding: 24 }}>
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

        {/* REQUESTS */}
        {page === 'requests' && <RequestsPage token={token} />}

        {/* LEADS */}
        {page === 'leads' && <LeadsPage token={token} />}

        {/* LIVE TESTED LEADS */}
        {page === 'tested_leads' && <TestedLeadsPage token={token} />}

        {/* SITE CONTENT */}
        {page === 'site' && (
          <SiteEditor token={token} />
        )}
        </div>
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
    fetch(`${API}/site`).then(r => r.json()).then(d => {
      const defaults = {
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
        about: {
          title: 'Humanizing the',
          highlight: 'Online Showroom',
          subtitle: 'ShopCall was founded to bridge the massive trust and conversion gap between physical retail stores and static digital shopping websites.',
          storyTitle: 'Why ShopCall?',
          storyContent1: 'In traditional physical retail, a sales agent greets customers, shows products live, answers questions instantly, and builds trust. In online shopping, customers are left with flat pictures and text descriptions, leading to low conversion rates and high return rates.',
          storyContent2: 'We created ShopCall to bring back the human touch. Our SDK allows any merchant—from boutique fashion sellers to premium electronics stores—to invite customers into their showroom with just one click.',
          principles: [
            { t: 'Frictionless Experience', d: 'No downloads, signups, or logins. A customer clicks a button and is instantly in a video call inside their browser.' },
            { t: 'Built for Scale', d: 'Engineered on top of world-class video infrastructure that functions perfectly on mobile and low-bandwidth networks.' },
            { t: 'Merchant First', d: 'Simple dashboard analytics, agent logins, and flexible custom configurations tailored for individual brand identities.' }
          ]
        },
        careers: {
          title: 'Build the future of',
          highlight: 'live retail',
          subtitle: 'We are on a mission to bring human connection back to online shopping. If you love building fast, high-impact products, we would love to have you on board.',
          roles: [
            { title: 'Senior WebRTC Engineer', team: 'Engineering', location: 'Kolkata, India / Remote', type: 'Full-time', desc: 'Help us optimize and scale our video infrastructure. Deep knowledge of WebRTC, peer-to-peer signaling, and TURN/STUN servers is required.' },
            { title: 'Frontend Engineer (React)', team: 'Product', location: 'Kolkata, India / Remote', type: 'Full-time', desc: 'Craft premium dashboards, real-time calling interfaces, and embeddable customer widgets. Experience with CSS animations and React is key.' },
            { title: 'Sales & Merchant Success Manager', team: 'Growth', location: 'Mumbai/Bangalore, India', type: 'Full-time', desc: 'Onboard and consult boutique stores, jewelry brands, and luxury e-commerce sellers in adopting live video commerce.' }
          ]
        },
        partners: {
          title: 'Grow your agency with',
          highlight: 'Live Commerce',
          subtitle: 'Partner with ShopCall to introduce premium live video shopping tools to your clients, Shopify stores, and custom e-commerce brands.',
          perks: [
            { t: '20% Recurring Revenue Share', d: 'Earn a lifetime 20% recurring commission on all subscription payments made by the stores you refer.' },
            { t: 'Technical Co-marketing & Support', d: 'Get direct priority access to our WebRTC engineering teams and features tailored for your enterprise clients.' },
            { t: 'Partner Sandbox Account', d: 'Access specialized developer sandboxes to demonstrate and test video widget configurations for your leads.' }
          ]
        },
        docs: {
          title: 'SDK Integration Guide',
          subtitle: 'Add a floating Live Video Commerce widget to any store with a single line of JavaScript.',
          scriptSnippet: '<script \n  src="https://shopcall.store/sdk/shopcall-sdk.js" \n  data-store="YOUR_SDK_KEY">\n</script>'
        },
        demo: {
          title: 'AURA BOUTIQUE',
          subtitle: 'EXCLUSIVE HANDLOOM COLLECTION',
          products: [
            { name: 'Royal Banarasi Silk Saree', price: '₹14,999', desc: 'Handwoven pure silk Banarasi saree with rich zari border and floral motifs. Perfect for bridal events.', img: '🌸' },
            { name: 'Kundan Antique Gold Necklace', price: '₹48,500', desc: 'Traditional Kundan studded choker necklace set in gold plating with matching earrings.', img: '💎' },
            { name: 'Designer Georgette Lehenga', price: '₹34,999', desc: 'Ethereal emerald green lehenga choli set with intricate hand embroidery and sequins work.', img: '👗' }
          ]
        }
      };
      setContent({
        ...defaults,
        ...d,
        footer: d.footer || defaults.footer,
        about: d.about || defaults.about,
        careers: d.careers || defaults.careers,
        partners: d.partners || defaults.partners,
        docs: d.docs || defaults.docs,
        demo: d.demo || defaults.demo
      });
    }).catch(() => {});
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

  const updateAbout = (key, val) => setContent({ ...content, about: { ...content.about, [key]: val } });
  const updateAboutPrinciple = (i, key, val) => { const p = [...content.about.principles]; p[i] = { ...p[i], [key]: val }; setContent({ ...content, about: { ...content.about, principles: p } }); };
  const addAboutPrinciple = () => setContent({ ...content, about: { ...content.about, principles: [...content.about.principles, { t: 'New Principle', d: 'Description' }] } });
  const removeAboutPrinciple = (i) => setContent({ ...content, about: { ...content.about, principles: content.about.principles.filter((_, idx) => idx !== i) } });

  const updateCareers = (key, val) => setContent({ ...content, careers: { ...content.careers, [key]: val } });
  const updateCareersRole = (i, key, val) => { const r = [...content.careers.roles]; r[i] = { ...r[i], [key]: val }; setContent({ ...content, careers: { ...content.careers, roles: r } }); };
  const addCareersRole = () => setContent({ ...content, careers: { ...content.careers, roles: [...content.careers.roles, { title: 'Role Title', team: 'Team', location: 'Location', type: 'Full-time', desc: 'Description' }] } });
  const removeCareersRole = (i) => setContent({ ...content, careers: { ...content.careers, roles: content.careers.roles.filter((_, idx) => idx !== i) } });

  const updatePartners = (key, val) => setContent({ ...content, partners: { ...content.partners, [key]: val } });
  const updatePartnersPerk = (i, key, val) => { const p = [...content.partners.perks]; p[i] = { ...p[i], [key]: val }; setContent({ ...content, partners: { ...content.partners, perks: p } }); };
  const addPartnersPerk = () => setContent({ ...content, partners: { ...content.partners, perks: [...content.partners.perks, { t: 'New Perk', d: 'Description' }] } });
  const removePartnersPerk = (i) => setContent({ ...content, partners: { ...content.partners, perks: content.partners.perks.filter((_, idx) => idx !== i) } });

  const updateDocs = (key, val) => setContent({ ...content, docs: { ...content.docs, [key]: val } });

  const updateDemo = (key, val) => setContent({ ...content, demo: { ...content.demo, [key]: val } });
  const updateDemoProduct = (i, key, val) => { const p = [...content.demo.products]; p[i] = { ...p[i], [key]: val }; setContent({ ...content, demo: { ...content.demo, products: p } }); };
  const addDemoProduct = () => setContent({ ...content, demo: { ...content.demo, products: [...content.demo.products, { name: 'Product Name', price: '₹0', desc: 'Description', img: '🛍️' }] } });
  const removeDemoProduct = (i) => setContent({ ...content, demo: { ...content.demo, products: content.demo.products.filter((_, idx) => idx !== i) } });

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
        {['hero', 'stats', 'features', 'steps', 'pricing', 'finalCta', 'footer', 'about', 'careers', 'partners', 'docs', 'demo', 'scale'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: tab === t ? '#6366f1' : '#1f1f23', color: tab === t ? '#fff' : '#71717a', fontSize: 11, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'finalCta' ? 'Final CTA' : t === 'scale' ? 'Scale %' : t}</button>
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

      {/* FOOTER */}
      {tab === 'footer' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Footer Settings</h3>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Tagline</label>
              <textarea value={content.footer?.tagline || ''} onChange={e => setContent({ ...content, footer: { ...content.footer, tagline: e.target.value } })} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Copyright</label>
              <input value={content.footer?.copyright || ''} onChange={e => setContent({ ...content, footer: { ...content.footer, copyright: e.target.value } })} style={inputStyle} />
            </div>
          </div>

          {/* Columns */}
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Footer Columns</h3>
          {(content.footer?.columns || []).map((col, ci) => (
            <div key={ci} style={{ ...cardStyle, position: 'relative' }}>
              <button onClick={() => { const cols = [...(content.footer?.columns || [])]; cols.splice(ci, 1); setContent({ ...content, footer: { ...content.footer, columns: cols } }); }} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Column Title</label>
                <input value={col.title} onChange={e => { const cols = [...(content.footer?.columns || [])]; cols[ci] = { ...cols[ci], title: e.target.value }; setContent({ ...content, footer: { ...content.footer, columns: cols } }); }} style={inputStyle} />
              </div>
              <label style={labelStyle}>Links</label>
              {(col.links || []).map((link, li) => (
                <div key={li} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  <input value={link.label} placeholder="Label" onChange={e => { const cols = [...(content.footer?.columns || [])]; const links = [...cols[ci].links]; links[li] = { ...links[li], label: e.target.value }; cols[ci] = { ...cols[ci], links }; setContent({ ...content, footer: { ...content.footer, columns: cols } }); }} style={{ ...inputStyle, flex: 1 }} />
                  <input value={link.url} placeholder="URL" onChange={e => { const cols = [...(content.footer?.columns || [])]; const links = [...cols[ci].links]; links[li] = { ...links[li], url: e.target.value }; cols[ci] = { ...cols[ci], links }; setContent({ ...content, footer: { ...content.footer, columns: cols } }); }} style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => { const cols = [...(content.footer?.columns || [])]; const links = [...cols[ci].links]; links.splice(li, 1); cols[ci] = { ...cols[ci], links }; setContent({ ...content, footer: { ...content.footer, columns: cols } }); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '0 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
                </div>
              ))}
              <button onClick={() => { const cols = [...(content.footer?.columns || [])]; const links = [...(cols[ci].links || []), { label: 'New Link', url: '/' }]; cols[ci] = { ...cols[ci], links }; setContent({ ...content, footer: { ...content.footer, columns: cols } }); }} style={{ background: 'transparent', color: '#6366f1', border: 'none', fontSize: 11, cursor: 'pointer', marginTop: 4 }}>+ Add link</button>
            </div>
          ))}
          <button onClick={() => setContent({ ...content, footer: { ...content.footer, columns: [...(content.footer?.columns || []), { title: 'New Column', links: [{ label: 'Link', url: '/' }] }] } })} style={{ background: '#1f1f23', color: '#a1a1aa', border: '1px dashed #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%', marginBottom: 16 }}>+ Add Column</button>

          {/* Socials */}
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Social Links</h3>
          <div style={cardStyle}>
            {(content.footer?.socials || []).map((s, si) => (
              <div key={si} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <input value={s.platform} placeholder="Platform" onChange={e => { const socs = [...(content.footer?.socials || [])]; socs[si] = { ...socs[si], platform: e.target.value }; setContent({ ...content, footer: { ...content.footer, socials: socs } }); }} style={{ ...inputStyle, width: 100 }} />
                <input value={s.url} placeholder="URL" onChange={e => { const socs = [...(content.footer?.socials || [])]; socs[si] = { ...socs[si], url: e.target.value }; setContent({ ...content, footer: { ...content.footer, socials: socs } }); }} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => { const socs = [...(content.footer?.socials || [])]; socs.splice(si, 1); setContent({ ...content, footer: { ...content.footer, socials: socs } }); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '0 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              </div>
            ))}
            <button onClick={() => setContent({ ...content, footer: { ...content.footer, socials: [...(content.footer?.socials || []), { platform: 'Twitter', url: '' }] } })} style={{ background: 'transparent', color: '#6366f1', border: 'none', fontSize: 11, cursor: 'pointer', marginTop: 4 }}>+ Add social</button>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {tab === 'about' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>About Page Hero</h3>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Header Title</label><input value={content.about?.title || ''} onChange={e => updateAbout('title', e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Header Highlight</label><input value={content.about?.highlight || ''} onChange={e => updateAbout('highlight', e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Subtitle</label><textarea value={content.about?.subtitle || ''} onChange={e => updateAbout('subtitle', e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></div>
          </div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Story Section</h3>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Story Title</label><input value={content.about?.storyTitle || ''} onChange={e => updateAbout('storyTitle', e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Paragraph 1</label><textarea value={content.about?.storyContent1 || ''} onChange={e => updateAbout('storyContent1', e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Paragraph 2</label><textarea value={content.about?.storyContent2 || ''} onChange={e => updateAbout('storyContent2', e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></div>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Core Principles</h3>
          {(content.about?.principles || []).map((p, idx) => (
            <div key={idx} style={{ ...cardStyle, position: 'relative' }}>
              <button onClick={() => removeAboutPrinciple(idx)} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              <div style={{ marginBottom: 10 }}><label style={labelStyle}>Title</label><input value={p.t || ''} onChange={e => updateAboutPrinciple(idx, 't', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Description</label><input value={p.d || ''} onChange={e => updateAboutPrinciple(idx, 'd', e.target.value)} style={inputStyle} /></div>
            </div>
          ))}
          <button onClick={addAboutPrinciple} style={{ background: '#1f1f23', color: '#a1a1aa', border: '1px dashed #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%', marginBottom: 16 }}>+ Add Principle</button>
        </div>
      )}

      {/* CAREERS */}
      {tab === 'careers' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Careers Hero</h3>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Header Title</label><input value={content.careers?.title || ''} onChange={e => updateCareers('title', e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Header Highlight</label><input value={content.careers?.highlight || ''} onChange={e => updateCareers('highlight', e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Subtitle</label><textarea value={content.careers?.subtitle || ''} onChange={e => updateCareers('subtitle', e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></div>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Open Roles</h3>
          {(content.careers?.roles || []).map((r, idx) => (
            <div key={idx} style={{ ...cardStyle, position: 'relative' }}>
              <button onClick={() => removeCareersRole(idx)} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={labelStyle}>Role Title</label><input value={r.title || ''} onChange={e => updateCareersRole(idx, 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Team</label><input value={r.team || ''} onChange={e => updateCareersRole(idx, 'team', e.target.value)} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={labelStyle}>Location</label><input value={r.location || ''} onChange={e => updateCareersRole(idx, 'location', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Type</label><input value={r.type || ''} onChange={e => updateCareersRole(idx, 'type', e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Description</label><textarea value={r.desc || ''} onChange={e => updateCareersRole(idx, 'desc', e.target.value)} style={{ ...inputStyle, minHeight: 40 }} /></div>
            </div>
          ))}
          <button onClick={addCareersRole} style={{ background: '#1f1f23', color: '#a1a1aa', border: '1px dashed #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%', marginBottom: 16 }}>+ Add Role</button>
        </div>
      )}

      {/* PARTNERS */}
      {tab === 'partners' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Partners Hero</h3>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Header Title</label><input value={content.partners?.title || ''} onChange={e => updatePartners('title', e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Header Highlight</label><input value={content.partners?.highlight || ''} onChange={e => updatePartners('highlight', e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Subtitle</label><textarea value={content.partners?.subtitle || ''} onChange={e => updatePartners('subtitle', e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></div>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Program Perks</h3>
          {(content.partners?.perks || []).map((p, idx) => (
            <div key={idx} style={{ ...cardStyle, position: 'relative' }}>
              <button onClick={() => removePartnersPerk(idx)} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              <div style={{ marginBottom: 10 }}><label style={labelStyle}>Perk Title</label><input value={p.t || ''} onChange={e => updatePartnersPerk(idx, 't', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Perk Description</label><input value={p.d || ''} onChange={e => updatePartnersPerk(idx, 'd', e.target.value)} style={inputStyle} /></div>
            </div>
          ))}
          <button onClick={addPartnersPerk} style={{ background: '#1f1f23', color: '#a1a1aa', border: '1px dashed #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%', marginBottom: 16 }}>+ Add Perk</button>
        </div>
      )}

      {/* DOCS */}
      {tab === 'docs' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Docs Page</h3>
          <div style={{ marginBottom: 10 }}><label style={labelStyle}>Header Title</label><input value={content.docs?.title || ''} onChange={e => updateDocs('title', e.target.value)} style={inputStyle} /></div>
          <div style={{ marginBottom: 10 }}><label style={labelStyle}>Subtitle</label><textarea value={content.docs?.subtitle || ''} onChange={e => updateDocs('subtitle', e.target.value)} style={{ ...inputStyle, minHeight: 60 }} /></div>
          <div><label style={labelStyle}>Script Snippet</label><textarea value={content.docs?.scriptSnippet || ''} onChange={e => updateDocs('scriptSnippet', e.target.value)} style={{ ...inputStyle, minHeight: 100, fontFamily: 'monospace' }} /></div>
        </div>
      )}

      {/* DEMO */}
      {tab === 'demo' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Demo Store Branding</h3>
            <div style={{ marginBottom: 10 }}><label style={labelStyle}>Store Name (Title)</label><input value={content.demo?.title || ''} onChange={e => updateDemo('title', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Tagline / Collection (Subtitle)</label><input value={content.demo?.subtitle || ''} onChange={e => updateDemo('subtitle', e.target.value)} style={inputStyle} /></div>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Products</h3>
          {(content.demo?.products || []).map((p, idx) => (
            <div key={idx} style={{ ...cardStyle, position: 'relative' }}>
              <button onClick={() => removeDemoProduct(idx)} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>×</button>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={labelStyle}>Emoji/Img</label><input value={p.img || ''} onChange={e => updateDemoProduct(idx, 'img', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Product Name</label><input value={p.name || ''} onChange={e => updateDemoProduct(idx, 'name', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Price</label><input value={p.price || ''} onChange={e => updateDemoProduct(idx, 'price', e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Description</label><textarea value={p.desc || ''} onChange={e => updateDemoProduct(idx, 'desc', e.target.value)} style={{ ...inputStyle, minHeight: 40 }} /></div>
            </div>
          ))}
          <button onClick={addDemoProduct} style={{ background: '#1f1f23', color: '#a1a1aa', border: '1px dashed #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%', marginBottom: 16 }}>+ Add Product</button>
        </div>
      )}

      {/* SCALE */}
      {tab === 'scale' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Landing Page Scale</h3>
          <p style={{ fontSize: 11, color: '#71717a', marginBottom: 16 }}>Control the overall zoom/scale of the landing page. This applies to all text, fonts, and elements.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[80, 90, 100, 110, 120].map(v => (
              <button key={v} onClick={() => setContent({ ...content, scale: v })} style={{ padding: '10px 18px', borderRadius: 8, border: (content.scale || 100) === v ? '2px solid #6366f1' : '1px solid #1f1f23', background: (content.scale || 100) === v ? 'rgba(99,102,241,.15)' : '#09090b', color: (content.scale || 100) === v ? '#a78bfa' : '#71717a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{v}%</button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#52525b', marginTop: 12 }}>Current: {content.scale || 100}% · Click "Save All" to apply</p>
        </div>
      )}
    </div>
  );
}

function RequestsPage({ token }) {
  const [requests, setRequests] = useState([]);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/requests/contact`, { headers: h }).then(r => r.json()).then(setRequests).catch(() => {});
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/requests/contact/${id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
  };

  const statusColor = s => s === 'new' ? '#f59e0b' : s === 'contacted' ? '#6366f1' : '#22c55e';

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Contact Requests ({requests.length})</h2>
      {requests.length === 0 ? <p style={{ color: '#52525b', fontSize: 13, textAlign: 'center', padding: 40 }}>No contact requests yet</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requests.map(r => (
            <div key={r._id} style={{ background: '#111113', borderRadius: 10, padding: '16px 20px', border: '1px solid #1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</p>
                <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{r.phone} · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <select value={r.status} onChange={e => updateStatus(r._id, e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: statusColor(r.status), fontSize: 12, fontWeight: 500 }}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeadsPage({ token }) {
  const [leads, setLeads] = useState([]);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/requests/leads`, { headers: h }).then(r => r.json()).then(setLeads).catch(() => {});
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/requests/leads/${id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
  };

  const statusColor = s => s === 'new' ? '#f59e0b' : s === 'scheduled' ? '#6366f1' : s === 'completed' ? '#22c55e' : '#ef4444';

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Demo Leads ({leads.length})</h2>
      {leads.length === 0 ? <p style={{ color: '#52525b', fontSize: 13, textAlign: 'center', padding: 40 }}>No demo leads yet</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {leads.map(l => (
            <div key={l._id} style={{ background: '#111113', borderRadius: 10, padding: '16px 20px', border: '1px solid #1f1f23' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</p>
                  <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{l.email} · {l.phone}</p>
                </div>
                <select value={l.status} onChange={e => updateStatus(l._id, e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: statusColor(l.status), fontSize: 12, fontWeight: 500 }}>
                  <option value="new">New</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#a1a1aa' }}>
                <span>📅 {l.preferredDate}</span>
                <span>🕐 {l.preferredTime}</span>
                <span style={{ marginLeft: 'auto', color: '#52525b' }}>{new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TestedLeadsPage({ token }) {
  const [leads, setLeads] = useState([]);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/requests/tested-leads`, { headers: h })
      .then(r => r.json())
      .then(setLeads)
      .catch(() => {});
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/requests/tested-leads/${id}`, {
      method: 'PATCH',
      headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
  };

  const statusColor = s => s === 'new' ? '#f59e0b' : s === 'contacted' ? '#6366f1' : '#22c55e';

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Live Tested Leads ({leads.length})</h2>
      {leads.length === 0 ? (
        <p style={{ color: '#52525b', fontSize: 13, textAlign: 'center', padding: 40 }}>No tested leads yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {leads.map(l => (
            <div key={l._id} style={{ background: '#111113', borderRadius: 10, padding: '16px 20px', border: '1px solid #1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</p>
                <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{l.phone} · Tested {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <select value={l.status} onChange={e => updateStatus(l._id, e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: statusColor(l.status), fontSize: 12, fontWeight: 500 }}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

