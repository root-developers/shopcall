import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import usePush from '../usePush';
import { io as ioClient } from 'socket.io-client';

const NAV = [
  { id: 'overview', label: 'Overview', icon: '◎' },
  { id: 'calls', label: 'Calls', icon: '◉' },
  { id: 'analytics', label: 'Analytics', icon: '◆' },
  { id: 'agents', label: 'Agents', icon: '◈' },
  { id: 'integration', label: 'Integration', icon: '◇' },
  { id: 'billing', label: 'Billing', icon: '₹' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function Dashboard({ user, token, onLogout }) {
  const [page, setPage] = useState('overview');
  const [sidebar, setSidebar] = useState(false);
  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [agents, setAgents] = useState([]);
  const [tab, setTab] = useState('all');
  const [callPage, setCallPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', email: '' });
  const [agentErr, setAgentErr] = useState('');
  const navigate = useNavigate();
  const prevCount = useRef(0);
  const h = { Authorization: `Bearer ${token}` };
  const PER_PAGE = 8;
  usePush(token);

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API}/calls/stats`, { headers: h }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/calls`, { headers: h }).then(r => r.ok ? r.json() : []).then(setCalls).catch(() => {});
    fetch(`${API}/agents`, { headers: h }).then(r => r.ok ? r.json() : []).then(setAgents).catch(() => {});
  }, [token]);

  useEffect(() => {
    load();
    const i = setInterval(() => {
      fetch(`${API}/calls/incoming`, { headers: h }).then(r => r.ok ? r.json() : []).then(d => {
        prevCount.current = d.length;
        setIncoming(d);
      }).catch(() => {});
      load();
    }, 3000);
    return () => clearInterval(i);
  }, [token]);

  // Persistent AudioContext - keeps alive even when tab is minimized
  const audioCtxRef = useRef(null);
  const ringtoneRef = useRef(null);

  // Initialize audio context on first user interaction (login = interaction)
  useEffect(() => {
    function initAudio() {
      if (audioCtxRef.current) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      // Silent oscillator to keep audio context alive in background
      const silent = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0; // completely silent
      silent.connect(gain);
      gain.connect(ctx.destination);
      silent.start();
    }
    // Init on any click (handles autoplay policy)
    document.addEventListener('click', initAudio, { once: true });
    // Also try immediately (works if user already interacted)
    initAudio();

    // Listen for SW messages to start ringtone (when push arrives while minimized)
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data === 'start-ring') startRingtone();
        if (event.data === 'stop-ring') stopRingtone();
      });
    }

    return () => {
      document.removeEventListener('click', initAudio);
      stopRingtone();
      if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    };
  }, []);

  function startRingtone() {
    if (ringtoneRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      function ring() {
        if (!audioCtxRef.current) return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 440; g.gain.value = 0.25;
        o.start(); o.stop(ctx.currentTime + 0.15);
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 660; g2.gain.value = 0.25;
        o2.start(ctx.currentTime + 0.2); o2.stop(ctx.currentTime + 0.35);
      }
      ring();
      ringtoneRef.current = setInterval(ring, 2000);
    } catch(e) {}
  }

  function stopRingtone() {
    if (ringtoneRef.current) { clearInterval(ringtoneRef.current); ringtoneRef.current = null; }
  }

  // Start/stop ringtone based on incoming calls
  useEffect(() => {
    if (incoming.length > 0) startRingtone();
    else stopRingtone();
    return () => stopRingtone();
  }, [incoming.length]);

  const joinCall = async (call) => {
    stopRingtone();
    navigator.serviceWorker?.controller?.postMessage('stop-ring');
    const res = await fetch(`${API}/video/agent-join`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ callId: call._id }) });
    const data = await res.json();
    if (res.ok) navigate(`/call/${data.meetingId}?token=${data.token}&callId=${call._id}`);
  };

  const rejectCall = async (callId) => {
    stopRingtone();
    navigator.serviceWorker?.controller?.postMessage('stop-ring');
    await fetch(`${API}/video/reject-call`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ callId }) });
    setIncoming(prev => prev.filter(c => c._id !== callId));
    load();
  };

  const copy = () => { navigator.clipboard.writeText(`<script src="${API.replace('/api', '')}/sdk/shopcall-sdk.js" data-store="${user?.sdkKey}"></script>`); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const dur = (s) => !s ? '—' : s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`;
  const sc = (s) => s === 'connected' ? ['#22c55e','rgba(34,197,94,.1)'] : s === 'missed' ? ['#ef4444','rgba(239,68,68,.1)'] : s === 'rejected' ? ['#f59e0b','rgba(245,158,11,.1)'] : ['#6366f1','rgba(99,102,241,.1)'];

  const filtered = tab === 'all' ? calls : calls.filter(c => c.status === tab);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((callPage - 1) * PER_PAGE, callPage * PER_PAGE);

  if (!user) return <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, border: '2.5px solid #1f1f23', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b', color: '#f4f4f5', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .d-fade{animation:fadeUp .4s cubic-bezier(.16,1,.3,1)}
        .d-card{background:#111113;border:1px solid #1f1f23;border-radius:12px;transition:box-shadow .2s}
        .d-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.3)}
        .d-nav{transition:all .15s ease}
        .d-nav:hover{background:#18181b !important}
        .d-input{transition:border-color .2s,box-shadow .2s;outline:none}
        .d-input:focus{border-color:#6366f1 !important;box-shadow:0 0 0 2px rgba(99,102,241,.08)}
        .d-btn{transition:all .2s cubic-bezier(.16,1,.3,1)}
        .d-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.2)}
        .d-page-btn{transition:all .15s}
        .d-page-btn:hover:not(:disabled){background:#1f1f23;color:#fff}
        .d-page-btn:disabled{opacity:.3;cursor:not-allowed}
        @media(min-width:769px){.d-sidebar{position:relative !important;left:0 !important}.d-hamburger{display:none !important}.d-content{max-width:100% !important}}
        @media(max-width:768px){.d-sidebar{position:fixed !important}.d-stats{grid-template-columns:repeat(2,1fr) !important}.d-content{padding:16px !important}}
        @media(max-width:480px){.d-stats{grid-template-columns:1fr !important}.d-agent-form{flex-direction:column !important}}
      `}</style>

      {sidebar && <div onClick={() => setSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 40, animation: 'fadeUp .2s' }} />}

      {/* Sidebar */}
      <aside className="d-sidebar" style={{ width: 240, background: '#0c0c0e', borderRight: '1px solid #1f1f23', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: sidebar ? 0 : -240, zIndex: 50, transition: 'left .25s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f1f23' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>S</div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>ShopCall</span>
          </div>
          <p style={{ fontSize: 11, color: '#52525b', marginTop: 6, fontWeight: 500 }}>{user.storeName}</p>
        </div>

        <nav style={{ flex: 1, padding: '8px 8px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setSidebar(false); setCallPage(1); }} className="d-nav"
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', borderRadius: 8, background: page === n.id ? '#1f1f23' : 'transparent', color: page === n.id ? '#f4f4f5' : '#71717a', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
              <span style={{ fontSize: 14, opacity: page === n.id ? 1 : .6 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'calls' && incoming.length > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: 8, padding: '1px 6px', fontSize: 10, fontWeight: 600 }}>{incoming.length}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #1f1f23' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>{user.name?.[0]?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
              <p style={{ fontSize: 10, color: '#52525b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="d-nav" style={{ width: '100%', padding: '8px 12px', border: '1px solid #1f1f23', borderRadius: 8, background: 'transparent', color: '#71717a', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #1f1f23', position: 'sticky', top: 0, background: '#09090b', zIndex: 30 }}>
          <button className="d-hamburger" onClick={() => setSidebar(true)} style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: 6, color: '#f4f4f5', fontSize: 16, cursor: 'pointer', padding: '5px 9px', lineHeight: 1 }}>☰</button>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: -.2 }}>{NAV.find(n => n.id === page)?.label}</h2>
          {incoming.length > 0 && page !== 'calls' && (
            <button onClick={() => setPage('calls')} className="d-btn" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
              {incoming.length} incoming
            </button>
          )}
          <NotifBell token={token} />
        </header>

        <div className="d-content d-fade" style={{ padding: 24 }}>

          {/* OVERVIEW */}
          {page === 'overview' && stats && (
            <div className="d-fade">
              <div className="d-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Connected', val: stats.connected, color: '#22c55e', sub: 'calls' },
                  { label: 'Missed', val: stats.missed, color: '#ef4444', sub: 'calls' },
                  { label: 'Total', val: stats.total, color: '#f4f4f5', sub: 'calls' },
                  { label: 'Duration', val: stats.totalMinutes, color: '#a78bfa', sub: 'minutes' },
                  { label: 'Trial', val: `${stats.trialCustomersUsed}/${stats.trialLimit}`, color: stats.trialCustomersUsed >= stats.trialLimit ? '#ef4444' : '#22c55e', sub: 'used' },
                ].map(s => (
                  <div key={s.label} className="d-card" style={{ padding: 18 }}>
                    <p style={{ fontSize: 11, color: '#71717a', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: -.5 }}>{s.val}</p>
                    <p style={{ fontSize: 10, color: '#3f3f46', marginTop: 2 }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Recent */}
              <div className="d-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #1f1f23' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600 }}>Recent activity</h3>
                </div>
                <div style={{ padding: '4px 18px' }}>
                  {calls.length === 0 && <p style={{ color: '#3f3f46', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>No calls yet</p>}
                  {calls.slice(0, 6).map(c => (
                    <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #18181b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc(c.status)[0] }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{c.shopperName}</p>
                          <p style={{ fontSize: 11, color: '#52525b' }}>{new Date(c.startedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: sc(c.status)[0], background: sc(c.status)[1], padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* CALLS */}
          {page === 'calls' && (
            <div className="d-fade">
              {incoming.length > 0 && (
                <div className="d-card" style={{ padding: 18, marginBottom: 16, borderColor: '#6366f1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1.5s infinite' }} />
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>Incoming calls</h3>
                  </div>
                  {incoming.map(c => (
                    <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #1f1f23' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{c.shopperName}</p>
                        <p style={{ fontSize: 11, color: '#52525b' }}>{new Date(c.startedAt).toLocaleTimeString()}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => rejectCall(c._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                        <button onClick={() => joinCall(c)} className="d-btn" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Accept</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="d-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #1f1f23' }}>
                  {['all', 'connected', 'missed', 'rejected', 'pending'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setCallPage(1); }}
                      style={{ padding: '11px 16px', border: 'none', background: 'transparent', color: tab === t ? '#f4f4f5' : '#52525b', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent', textTransform: 'capitalize', transition: 'all .15s' }}>{t}</button>
                  ))}
                </div>
                <div style={{ padding: '4px 18px' }}>
                  {paginated.length === 0 && <p style={{ color: '#3f3f46', fontSize: 13, padding: '32px 0', textAlign: 'center' }}>No calls</p>}
                  {paginated.map(c => (
                    <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #18181b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc(c.status)[0] }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{c.shopperName}{c.shopperPhone ? <span style={{ color: '#52525b', fontWeight: 400 }}> · {c.shopperPhone}</span> : ''}</p>
                          <p style={{ fontSize: 11, color: '#52525b' }}>{new Date(c.startedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: '#52525b' }}>{dur(c.duration)}</span>
                        <span style={{ fontSize: 10, color: sc(c.status)[0], background: sc(c.status)[1], padding: '3px 7px', borderRadius: 5, fontWeight: 500 }}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #1f1f23' }}>
                    <button disabled={callPage === 1} onClick={() => setCallPage(p => p - 1)} className="d-page-btn" style={{ background: 'transparent', border: '1px solid #1f1f23', borderRadius: 6, color: '#71717a', padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>← Prev</button>
                    <span style={{ fontSize: 11, color: '#52525b' }}>{callPage} / {totalPages}</span>
                    <button disabled={callPage === totalPages} onClick={() => setCallPage(p => p + 1)} className="d-page-btn" style={{ background: 'transparent', border: '1px solid #1f1f23', borderRadius: 6, color: '#71717a', padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>Next →</button>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* AGENTS */}
          {page === 'agents' && (
            <div className="d-fade">
              <div className="d-card" style={{ padding: 18, marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Add agent</h3>
                <div className="d-agent-form" style={{ display: 'flex', gap: 8 }}>
                  <input className="d-input" placeholder="Name" value={agentForm.name} onChange={e => setAgentForm({ ...agentForm, name: e.target.value })}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 7, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 13 }} />
                  <input className="d-input" placeholder="Email" value={agentForm.email} onChange={e => setAgentForm({ ...agentForm, email: e.target.value })}
                    style={{ flex: 1.5, padding: '9px 12px', borderRadius: 7, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 13 }} />
                  <button onClick={async () => {
                    setAgentErr('');
                    const res = await fetch(`${API}/agents`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify(agentForm) });
                    const data = await res.json();
                    if (res.ok) { setAgents(data); setAgentForm({ name: '', email: '' }); } else setAgentErr(data.error);
                  }} className="d-btn" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add</button>
                </div>
                {agentErr && <p style={{ color: '#fca5a5', fontSize: 11, marginTop: 8 }}>{agentErr}</p>}
                <p style={{ color: '#3f3f46', fontSize: 11, marginTop: 10 }}>Agents login at <code style={{ color: '#6366f1' }}>/agent-login</code></p>
              </div>

              <div className="d-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600 }}>Team</h3>
                  <span style={{ fontSize: 11, color: '#52525b' }}>{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ padding: '4px 18px' }}>
                  {agents.length === 0 && <p style={{ color: '#3f3f46', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>No agents yet</p>}
                  {agents.map(a => (
                    <div key={a._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #18181b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>{a.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</p>
                          <p style={{ fontSize: 11, color: '#52525b' }}>{a.email}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: a.password ? '#22c55e' : '#f59e0b', fontWeight: 500 }}>{a.password ? 'Active' : 'Pending'}</span>
                        <button onClick={async () => { const r = await fetch(`${API}/agents/${a._id}`, { method: 'DELETE', headers: h }); if (r.ok) setAgents(await r.json()); }}
                          style={{ background: 'transparent', border: '1px solid #1f1f23', borderRadius: 5, color: '#71717a', cursor: 'pointer', fontSize: 11, padding: '3px 8px', transition: 'all .15s' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATION */}
          {page === 'integration' && (
            <IntegrationPage user={user} copied={copied} copy={copy} />
          )}

          {/* ANALYTICS */}
          {page === 'analytics' && stats && (
            <div className="d-fade">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                <div className="d-card" style={{ padding: 18 }}>
                  <p style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Conversion Rate</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{stats.total > 0 ? Math.round((stats.connected / stats.total) * 100) : 0}%</p>
                  <p style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{stats.connected} connected / {stats.total} total</p>
                </div>
                <div className="d-card" style={{ padding: 18 }}>
                  <p style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Avg Call Duration</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa' }}>{stats.connected > 0 ? Math.round(stats.totalMinutes / stats.connected) : 0}m</p>
                  <p style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>per connected call</p>
                </div>
                <div className="d-card" style={{ padding: 18 }}>
                  <p style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Miss Rate</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{stats.total > 0 ? Math.round((stats.missed / stats.total) * 100) : 0}%</p>
                  <p style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{stats.missed} missed calls</p>
                </div>
              </div>
              <div className="d-card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Call Breakdown</h3>
                <div style={{ display: 'flex', gap: 4, height: 24, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                  {stats.total > 0 && <>
                    <div style={{ width: `${(stats.connected/stats.total)*100}%`, background: '#22c55e', transition: 'width .3s' }} />
                    <div style={{ width: `${(stats.missed/stats.total)*100}%`, background: '#ef4444', transition: 'width .3s' }} />
                    <div style={{ width: `${((stats.total - stats.connected - stats.missed)/stats.total)*100}%`, background: '#6366f1', transition: 'width .3s' }} />
                  </>}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#22c55e' }} />Connected ({stats.connected})</span>
                  <span style={{ fontSize: 11, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} />Missed ({stats.missed})</span>
                  <span style={{ fontSize: 11, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#6366f1' }} />Other ({stats.total - stats.connected - stats.missed})</span>
                </div>
              </div>
              <div className="d-card" style={{ padding: 18, marginTop: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Usage</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #18181b' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Plan</span><span style={{ fontSize: 12, fontWeight: 500 }}>{user?.plan}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #18181b' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Calls used</span><span style={{ fontSize: 12 }}>{stats.trialCustomersUsed} / {stats.trialLimit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Total minutes</span><span style={{ fontSize: 12 }}>{stats.totalMinutes}m</span>
                </div>
              </div>
            </div>
          )}

          {/* BILLING */}
          {page === 'billing' && user && (
            <SettingsBilling user={user} token={token} h={h} stats={stats} />
          )}

          {/* SETTINGS */}
          {page === 'settings' && user && (
            <SettingsPage user={user} token={token} h={h} stats={stats} />
          )}

        </div>
      </main>
    </div>
  );
}

// Integration page with button customizer
function IntegrationPage({ user, copied, copy }) {
  const [cfg, setCfg] = useState({
    text: '📹 Live Shop',
    bg: '#6366f1',
    color: '#ffffff',
    radius: '50',
    position: 'bottom-right',
    size: '14',
  });
  const [customCopied, setCustomCopied] = useState(false);

  const positions = { 'bottom-right': 'bottom:24px;right:24px', 'bottom-left': 'bottom:24px;left:24px', 'top-right': 'top:24px;right:24px', 'top-left': 'top:24px;left:24px' };
  const posPreview = { 'bottom-right': { bottom: 16, right: 16 }, 'bottom-left': { bottom: 16, left: 16 }, 'top-right': { top: 16, right: 16 }, 'top-left': { top: 16, left: 16 } };

  const genCode = () => `<script src="${API.replace('/api', '')}/sdk/shopcall-sdk.js"
  data-store="${user?.sdkKey}"
  data-text="${cfg.text}"
  data-bg="${cfg.bg}"
  data-color="${cfg.color}"
  data-radius="${cfg.radius}"
  data-position="${cfg.position}"
  data-size="${cfg.size}"></script>`;

  const copyCustom = () => { navigator.clipboard.writeText(genCode()); setCustomCopied(true); setTimeout(() => setCustomCopied(false), 2000); };

  return (
    <div className="d-fade">
      {/* Customizer */}
      <div className="d-card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Button Customizer</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Text */}
          <div>
            <label style={lbl}>Button text</label>
            <input className="d-input" value={cfg.text} onChange={e => setCfg({ ...cfg, text: e.target.value })} style={inp} />
          </div>
          {/* Font size */}
          <div>
            <label style={lbl}>Font size (px)</label>
            <input className="d-input" type="number" min="10" max="24" value={cfg.size} onChange={e => setCfg({ ...cfg, size: e.target.value })} style={inp} />
          </div>
          {/* BG Color */}
          <div>
            <label style={lbl}>Background color</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.bg} onChange={e => setCfg({ ...cfg, bg: e.target.value })} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
              <input className="d-input" value={cfg.bg} onChange={e => setCfg({ ...cfg, bg: e.target.value })} style={{ ...inp, flex: 1 }} />
            </div>
          </div>
          {/* Text Color */}
          <div>
            <label style={lbl}>Text color</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.color} onChange={e => setCfg({ ...cfg, color: e.target.value })} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
              <input className="d-input" value={cfg.color} onChange={e => setCfg({ ...cfg, color: e.target.value })} style={{ ...inp, flex: 1 }} />
            </div>
          </div>
          {/* Border radius */}
          <div>
            <label style={lbl}>Border radius (px)</label>
            <input className="d-input" type="range" min="0" max="50" value={cfg.radius} onChange={e => setCfg({ ...cfg, radius: e.target.value })} style={{ width: '100%', accentColor: '#6366f1' }} />
            <span style={{ fontSize: 11, color: '#52525b' }}>{cfg.radius}px</span>
          </div>
          {/* Position */}
          <div>
            <label style={lbl}>Position</label>
            <select value={cfg.position} onChange={e => setCfg({ ...cfg, position: e.target.value })} style={{ ...inp, appearance: 'auto' }}>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ marginTop: 20 }}>
          <label style={lbl}>Preview</label>
          <div style={{ background: '#1f1f23', borderRadius: 10, height: 140, position: 'relative', overflow: 'hidden', border: '1px solid #27272a' }}>
            <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: '#52525b' }}>your-store.com</div>
            <div style={{ position: 'absolute', ...posPreview[cfg.position], background: cfg.bg, color: cfg.color, padding: '10px 18px', borderRadius: `${cfg.radius}px`, fontSize: `${cfg.size}px`, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,.3)', transition: 'all .3s ease' }}>
              {cfg.text}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Code */}
      <div className="d-card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600 }}>Your custom snippet</h3>
          <button onClick={copyCustom} className="d-btn" style={{ background: customCopied ? '#052e16' : '#1f1f23', border: 'none', borderRadius: 6, color: customCopied ? '#22c55e' : '#a1a1aa', padding: '5px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>{customCopied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <div style={{ background: '#09090b', borderRadius: 8, padding: 14, border: '1px solid #1f1f23' }}>
          <pre style={{ fontSize: 11, color: '#a78bfa', wordBreak: 'break-all', whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0, fontFamily: 'SF Mono, Menlo, monospace' }}>{genCode()}</pre>
        </div>
      </div>

      {/* SDK Key */}
      <div className="d-card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>SDK Key</h3>
        <div style={{ background: '#09090b', borderRadius: 8, padding: '10px 14px', border: '1px solid #1f1f23' }}>
          <code style={{ fontSize: 14, color: '#f4f4f5', fontWeight: 500, letterSpacing: .3 }}>{user?.sdkKey}</code>
        </div>
      </div>

      {/* Guide */}
      <div className="d-card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Setup guide</h3>
        {['Customize the button above to match your brand', 'Copy the generated snippet', 'Paste before </body> on your site', 'The button appears — customers click to video call', 'First 5 customers are free (trial)'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#6366f1', flexShrink: 0 }}>{i + 1}</div>
            <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 11, fontWeight: 500, color: '#71717a', marginBottom: 5 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 12, outline: 'none' };

// Notification Bell
function NotifBell({ token }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef(null);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!token) return;
    const load = () => {
      fetch(`${API}/notifications/unread`, { headers: h }).then(r => r.ok ? r.json() : {}).then(d => setUnread(d.count || 0)).catch(() => {});
    };
    load();
    const i = setInterval(load, 5000);

    // Listen for real-time notifications via socket
    const SOCKET_URL = API.replace('/api', '');
    const s = ioClient(SOCKET_URL);
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    s.emit('register-user', userId);
    s.on('notification', (n) => { setNotifs(prev => [n, ...prev]); setUnread(u => u + 1); });
    return () => { clearInterval(i); s.disconnect(); };
  }, [token]);

  const openPanel = async () => {
    setOpen(!open);
    if (!open) {
      const res = await fetch(`${API}/notifications`, { headers: h });
      if (res.ok) setNotifs(await res.json());
      await fetch(`${API}/notifications/read`, { method: 'POST', headers: h });
      setUnread(0);
    }
  };

  return (
    <div ref={bellRef} style={{ position: 'relative', marginLeft: 'auto' }}>
      <button onClick={openPanel} style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: 6, color: '#f4f4f5', fontSize: 14, cursor: 'pointer', padding: '5px 9px', position: 'relative' }}>
        🔔
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, minWidth: 14, height: 14, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 280, maxHeight: 320, overflowY: 'auto', background: '#111113', border: '1px solid #1f1f23', borderRadius: 10, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1f1f23' }}>
            <h4 style={{ fontSize: 12, fontWeight: 600 }}>Notifications</h4>
          </div>
          {notifs.length === 0 ? <p style={{ padding: 20, textAlign: 'center', color: '#52525b', fontSize: 12 }}>No notifications</p> : (
            notifs.slice(0, 20).map(n => (
              <div key={n._id} style={{ padding: '10px 14px', borderBottom: '1px solid #18181b', opacity: n.read ? .6 : 1 }}>
                <p style={{ fontSize: 12, fontWeight: 500 }}>{n.title}</p>
                {n.body && <p style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{n.body}</p>}
                <p style={{ fontSize: 10, color: '#3f3f46', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Settings + Billing page
function SettingsPage({ user, token, h, stats }) {
  const nextBilling = stats?.billingCycleEnd ? new Date(stats.billingCycleEnd) : null;
  return (
    <div className="d-fade">
      <div className="d-card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Store Information</h3>
        {[['Store Name', user.storeName], ['Email', user.email], ['Owner', user.name], ['SDK Key', user.sdkKey], ['Plan', user.plan], ['Next Billing', user.plan !== 'trial' && nextBilling ? nextBilling.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A (Trial)'], ['Created', new Date(user.createdAt).toLocaleDateString()]].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #18181b' }}>
            <span style={{ fontSize: 12, color: '#71717a' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>
      <div className="d-card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Notifications</h3>
        <p style={{ fontSize: 12, color: '#71717a' }}>Push notifications: {typeof Notification !== 'undefined' && Notification.permission === 'granted' ? <span style={{ color: '#22c55e' }}>enabled ✓</span> : <span style={{ color: '#f59e0b' }}>not enabled</span>}</p>
        <p style={{ fontSize: 11, color: '#52525b', marginTop: 6 }}>Install as app on phone for call notifications.</p>
      </div>
    </div>
  );
}

// Billing page (dedicated)
function SettingsBilling({ user, token, h, stats }) {
  const [bills, setBills] = useState([]);
  const [pending, setPending] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [msg, setMsg] = useState('');
  const PLANS = { trial: { price: 0, label: 'Trial (Free)' }, starter: { price: 999, label: 'Starter ₹999/mo' }, pro: { price: 2999, label: 'Pro ₹2,999/mo' } };

  const loadBilling = () => {
    fetch(`${API}/billing/history`, { headers: h }).then(r => r.ok ? r.json() : []).then(setBills).catch(() => {});
    fetch(`${API}/billing/pending`, { headers: h }).then(r => r.ok ? r.json() : {}).then(d => setPending(d.pending)).catch(() => {});
  };
  useEffect(() => { loadBilling(); }, []);

  const upgrade = async (plan) => {
    setUpgrading(true); setMsg('');
    const res = await fetch(`${API}/billing/upgrade`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
    const data = await res.json();
    if (res.ok) { setMsg(data.amount > 0 ? `Upgrade requested! Pay ₹${data.amount} to activate. Admin will verify.` : 'Plan updated!'); loadBilling(); }
    else setMsg(data.error);
    setUpgrading(false);
  };
  const cancelPending = async () => { await fetch(`${API}/billing/cancel`, { method: 'POST', headers: h }); setMsg('Request cancelled.'); setPending(null); loadBilling(); };

  const nextBilling = stats?.billingCycleEnd ? new Date(stats.billingCycleEnd) : null;
  const daysLeft = nextBilling ? Math.max(0, Math.ceil((nextBilling - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="d-fade">
      {/* Current plan + next billing */}
      <div className="d-card" style={{ padding: 18, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5 }}>Current Plan</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#6366f1', marginTop: 4 }}>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</p>
        </div>
        {user.plan !== 'trial' && nextBilling && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#71717a' }}>Next billing date</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: daysLeft <= 5 ? '#ef4444' : '#f4f4f5', marginTop: 2 }}>{nextBilling.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p style={{ fontSize: 11, color: daysLeft <= 5 ? '#ef4444' : '#52525b' }}>{daysLeft} days remaining</p>
          </div>
        )}
        {user.plan === 'trial' && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#71717a' }}>Trial</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>No expiry</p>
          </div>
        )}
      </div>
      <div className="d-card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Choose Plan</h3>
        {pending && (
          <div style={{ background: '#1a1a00', border: '1px solid #f59e0b', borderRadius: 8, padding: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>⏳ Pending: Upgrade to {pending.plan}</p>
              <p style={{ fontSize: 11, color: '#71717a' }}>₹{pending.amount} · Waiting for admin approval</p>
            </div>
            <button onClick={cancelPending} style={{ background: 'transparent', border: '1px solid #f59e0b', borderRadius: 6, color: '#f59e0b', padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {Object.entries(PLANS).map(([key, p]) => (
            <div key={key} style={{ background: user.plan === key ? '#1a1a2e' : pending?.plan === key ? '#1a1a00' : '#09090b', border: user.plan === key ? '1px solid #6366f1' : pending?.plan === key ? '1px solid #f59e0b' : '1px solid #1f1f23', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5' }}>{p.price === 0 ? 'Free' : `₹${p.price}`}</p>
              <p style={{ fontSize: 10, color: '#52525b', marginBottom: 10 }}>/month</p>
              {user.plan === key ? <span style={{ fontSize: 11, color: '#22c55e' }}>Current plan</span>
                : pending?.plan === key ? <span style={{ fontSize: 11, color: '#f59e0b' }}>Pending approval</span>
                : <button disabled={upgrading} onClick={() => upgrade(key)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: upgrading ? .5 : 1 }}>{key === 'trial' ? 'Downgrade' : 'Upgrade'}</button>}
            </div>
          ))}
        </div>
        {msg && <p style={{ fontSize: 12, color: '#a5b4fc', marginTop: 12 }}>{msg}</p>}
      </div>
      <div className="d-card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Billing History</h3>
        {bills.length === 0 ? <p style={{ fontSize: 12, color: '#52525b' }}>No billing records</p> : bills.map(b => (
          <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #18181b' }}>
            <div>
              <p style={{ fontSize: 12 }}>Upgrade to <strong>{b.plan}</strong></p>
              <p style={{ fontSize: 10, color: '#52525b' }}>{new Date(b.createdAt).toLocaleDateString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, fontWeight: 600 }}>₹{b.amount}</p>
              <span style={{ fontSize: 10, color: b.status === 'paid' ? '#22c55e' : b.status === 'failed' ? '#ef4444' : b.status === 'cancelled' ? '#71717a' : '#f59e0b' }}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}
