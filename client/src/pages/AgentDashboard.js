import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import usePush from '../usePush';

export default function AgentDashboard({ agent, token, onLogout }) {
  const [incoming, setIncoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('live');
  const prevCount = useRef(0);
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };
  usePush(token);

  useEffect(() => {
    if (!token) return;
    const poll = () => {
      fetch(`${API}/agents/incoming`, { headers }).then(r => r.ok ? r.json() : []).then(data => {
        if (data.length > prevCount.current) playBeep();
        prevCount.current = data.length;
        setIncoming(data);
      }).catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/agents/history`, { headers }).then(r => r.ok ? r.json() : []).then(setHistory).catch(() => {});
  }, [token]);

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 800; gain.gain.value = 0.3;
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  const joinCall = async (call) => {
    const res = await fetch(`${API}/video/agent-join`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId: call.meetingId, callId: call._id })
    });
    const data = await res.json();
    navigate(`/call/${call.meetingId}?token=${data.token}&callId=${call._id}`);
  };

  if (!agent) return <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .ag-pulse{animation:agPulse 2s infinite}
        @keyframes agPulse{0%,100%{opacity:1}50%{opacity:.5}}
        .ag-ring{animation:agRing 1s ease-in-out infinite}
        @keyframes agRing{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        .ag-card{transition:all .2s cubic-bezier(.16,1,.3,1)}
        .ag-card:hover{border-color:#6366f1 !important;transform:translateY(-2px)}
        .ag-btn{transition:all .15s ease}
        .ag-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(99,102,241,.3)}
        .ag-tab{transition:all .15s}
        @media(max-width:600px){.ag-header{padding:14px 16px !important}.ag-main{padding:20px 16px !important}.ag-stat-grid{grid-template-columns:1fr 1fr !important}}
      `}</style>

      {/* Header */}
      <header className="ag-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderBottom: '1px solid #1f1f23', background: '#0c0c0e', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>S</div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ShopCall</span>
          <span style={{ fontSize: 12, color: '#71717a', background: '#1f1f23', padding: '3px 8px', borderRadius: 5, fontWeight: 500 }}>Agent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} className="ag-pulse" />
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>{agent.name}</span>
          </div>
          <button onClick={onLogout} className="ag-btn" style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, background: 'transparent', border: '1px solid #27272a', borderRadius: 7, color: '#a1a1aa', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main className="ag-main" style={{ maxWidth: 800, margin: '0 auto', padding: '28px' }}>
        {/* Status + Stats */}
        <div className="ag-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#111113', borderRadius: 12, padding: '18px 20px', border: '1px solid #1f1f23' }}>
            <p style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#22c55e' }}>Online</span>
            </div>
          </div>
          <div style={{ background: '#111113', borderRadius: 12, padding: '18px 20px', border: '1px solid #1f1f23' }}>
            <p style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Incoming</p>
            <span style={{ fontSize: 22, fontWeight: 700, color: incoming.length > 0 ? '#6366f1' : '#f4f4f5' }}>{incoming.length}</span>
          </div>
          <div style={{ background: '#111113', borderRadius: 12, padding: '18px 20px', border: '1px solid #1f1f23' }}>
            <p style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Today's Calls</p>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{history.filter(h => new Date(h.startedAt).toDateString() === new Date().toDateString()).length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#111113', borderRadius: 10, padding: 4, border: '1px solid #1f1f23' }}>
          {[['live', `Live${incoming.length > 0 ? ` (${incoming.length})` : ''}`], ['history', 'Call History']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="ag-tab" style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: tab === id ? '#6366f1' : 'transparent', color: tab === id ? '#fff' : '#71717a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>

        {/* Live Tab */}
        {tab === 'live' && (
          <>
            {incoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', background: '#111113', borderRadius: 14, border: '1px solid #1f1f23' }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: .4 }}>📞</div>
                <p style={{ fontSize: 16, fontWeight: 500, color: '#a1a1aa', marginBottom: 6 }}>No incoming calls</p>
                <p style={{ fontSize: 13, color: '#52525b' }}>Waiting for customers... Auto-refreshes every 3s</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {incoming.map(call => (
                  <div key={call._id} className="ag-card ag-ring" style={{ background: '#111113', borderRadius: 14, padding: '18px 22px', border: '1px solid #6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#1f1f23,#27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600 }}>{call.shopperName || 'Customer'}</p>
                        <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <button onClick={() => joinCall(call)} className="ag-btn" style={{ padding: '10px 22px', fontSize: 14, fontWeight: 600, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📹</span> Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div style={{ background: '#111113', borderRadius: 14, border: '1px solid #1f1f23', overflow: 'hidden' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#52525b' }}>
                <p style={{ fontSize: 14 }}>No call history yet</p>
              </div>
            ) : (
              history.slice(0, 20).map((call, i) => (
                <div key={call._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < Math.min(history.length, 20) - 1 ? '1px solid #1f1f23' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: call.status === 'connected' ? '#22c55e' : call.status === 'missed' ? '#ef4444' : '#f59e0b' }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{call.shopperName || 'Customer'}</p>
                      <p style={{ fontSize: 11, color: '#52525b' }}>{new Date(call.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: call.status === 'connected' ? '#22c55e' : call.status === 'missed' ? '#ef4444' : '#f59e0b', textTransform: 'capitalize' }}>{call.status || 'ended'}</span>
                    {call.duration > 0 && <p style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>{Math.round(call.duration / 60)}m {call.duration % 60}s</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
