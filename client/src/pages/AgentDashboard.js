import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import usePush from '../usePush';

export default function AgentDashboard({ agent, token, onLogout }) {
  const [incoming, setIncoming] = useState([]);
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

  if (!agent) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1a1a1a' }}>
        <h2 style={{ color: '#6366f1' }}>ShopCall <span style={{ color: '#888', fontSize: 14, fontWeight: 400 }}>Agent</span></h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#888', fontSize: 14 }}>{agent.name}</span>
          <button onClick={onLogout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 12 }}>Logout</button>
        </div>
      </header>

      <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ background: '#111', borderRadius: 12, padding: 24, border: '1px solid #222', textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: '#22c55e', fontSize: 14 }}>● Online — Waiting for calls</p>
        </div>

        {incoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📞</p>
            <p>No incoming calls right now.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>This page auto-refreshes every 3 seconds.</p>
          </div>
        ) : (
          <div style={{ background: '#1a1a2e', border: '1px solid #6366f1', borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: '#6366f1', marginBottom: 16 }}>🔔 Incoming Calls ({incoming.length})</h3>
            {incoming.map(call => (
              <div key={call._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' }}>
                <div>
                  <p style={{ fontSize: 14 }}>{call.shopperName}</p>
                  <p style={{ color: '#888', fontSize: 12 }}>{new Date(call.startedAt).toLocaleTimeString()}</p>
                </div>
                <button onClick={() => joinCall(call)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>Join Call</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
