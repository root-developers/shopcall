import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MeetingProvider, useMeeting, useParticipant, MeetingConsumer } from '@videosdk.live/react-sdk';
import { io } from 'socket.io-client';
import { API } from '../App';

const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

function VideoTile({ participantId, isLocal, isPinned, onPin }) {
  const { webcamStream, webcamOn, micOn, micStream, displayName } = useParticipant(participantId);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const stream = new MediaStream();
      stream.addTrack(webcamStream.track);
      videoRef.current.srcObject = stream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micStream && audioRef.current && !isLocal) {
      const stream = new MediaStream();
      stream.addTrack(micStream.track);
      audioRef.current.srcObject = stream;
    }
  }, [micStream, isLocal]);

  return (
    <div onClick={() => onPin(participantId)} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#18181b', height: isPinned ? '100%' : '100%', minHeight: isPinned ? 0 : 80, cursor: 'pointer', border: isPinned ? '2px solid #6366f1' : '1px solid #27272a', transition: 'all .2s' }}>
      {!isLocal && <audio ref={audioRef} autoPlay />}
      {webcamOn ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isLocal ? 'scaleX(-1)' : 'none' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>{displayName?.[0]?.toUpperCase() || '?'}</div>
          <p style={{ color: '#71717a', fontSize: 12 }}>{displayName}</p>
        </div>
      )}
      {/* Overlay info */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,.7))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>{displayName}{isLocal ? ' (You)' : ''}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {!micOn && <span style={{ fontSize: 10, background: 'rgba(239,68,68,.8)', borderRadius: 4, padding: '2px 4px' }}>🔇</span>}
          {isPinned && <span style={{ fontSize: 10, background: 'rgba(99,102,241,.8)', borderRadius: 4, padding: '2px 4px' }}>📌</span>}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ onClose, callId, agentName, onNewMessage }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_URL);
    socketRef.current = s;
    s.emit('join-room', callId);
    s.on('chat-message', (data) => {
      setMessages(prev => [...prev, { ...data, isMe: false }]);
      if (onNewMessage) onNewMessage();
    });
    // Load history
    fetch(`${API}/chat/${callId}`).then(r => r.json()).then(history => {
      setMessages(history.map(m => ({ ...m, isMe: m.senderRole === 'agent' })));
    }).catch(() => {});
    return () => s.disconnect();
  }, [callId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!msg.trim()) return;
    socketRef.current?.emit('chat-message', { callId, sender: agentName, senderRole: 'agent', message: msg.trim() });
    setMessages(prev => [...prev, { sender: 'You', message: msg.trim(), isMe: true }]);
    setMsg('');
  };

  return (
    <div style={{ width: 300, background: '#0f0f11', borderLeft: '1px solid #1f1f23', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600 }}>In-call chat</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && <p style={{ color: '#3f3f46', fontSize: 12, textAlign: 'center', marginTop: 20 }}>No messages yet. Share links or product info here.</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            {!m.isMe && <p style={{ fontSize: 10, color: '#52525b', marginBottom: 2 }}>{m.sender}</p>}
            <div style={{ background: m.isMe ? '#6366f1' : '#1f1f23', borderRadius: 8, padding: '8px 12px' }}>
              <p style={{ fontSize: 13, color: '#f4f4f5', wordBreak: 'break-word' }}>{m.message}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #1f1f23', display: 'flex', gap: 8 }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..." style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #1f1f23', background: '#09090b', color: '#f4f4f5', fontSize: 13, outline: 'none' }} />
        <button onClick={send} style={{ background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', padding: '9px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
}

function MeetingView({ callId, token: authToken, userName }) {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [unread, setUnread] = useState(0);
  const joinedRef = useRef(false);

  const endCall = async () => {
    leave();
    if (callId) {
      await fetch(`${API}/video/end-call`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId })
      });
    }
    navigate('/dashboard');
  };

  const { participants, leave, toggleMic, toggleWebcam, localParticipant, join } = useMeeting({
    onMeetingJoined: () => { console.log('Meeting joined'); },
    onParticipantLeft: () => { endCall(); },
    onMeetingLeft: () => { navigate('/dashboard'); },
  });

  useEffect(() => {
    if (!joinedRef.current) {
      joinedRef.current = true;
      setTimeout(() => join(), 500);
    }
  }, []);

  const participantIds = useMemo(() => [...participants.keys()], [participants]);
  const remoteIds = useMemo(() => participantIds.filter(id => id !== localParticipant?.id), [participantIds, localParticipant]);
  const pinnedId = pinned && remoteIds.includes(pinned) ? pinned : null;
  // Show: pinned remote full-screen + local small, OR all side-by-side
  const gridIds = pinnedId ? [localParticipant?.id, ...remoteIds.filter(id => id !== pinnedId)].filter(Boolean) : participantIds;

  return (
    <div style={{ height: '100vh', background: '#09090b', display: 'flex', flexDirection: 'column', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .vc-btn{transition:all .15s;border:none;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center}
        .vc-btn:hover{transform:scale(1.1)}
        .vc-btn:active{transform:scale(.95)}
        .vc-chat-panel{width:300px;height:100%;flex-shrink:0}
        .vc-video-grid{display:grid;gap:8px;flex:1}
        @media(max-width:600px){
          .vc-chat-panel{position:fixed !important;inset:0 !important;width:100% !important;z-index:100;border:none !important}
          .vc-video-area{padding:4px !important}
          .vc-video-grid{gap:4px !important;grid-template-columns:1fr !important}
          .vc-controls{padding:10px 8px !important;gap:8px !important}
          .vc-btn{width:40px !important;height:40px !important;font-size:16px !important}
          .vc-btn-end{width:48px !important}
        }
        @media(max-width:380px){
          .vc-btn{width:36px !important;height:36px !important;font-size:14px !important}
          .vc-controls{padding:8px 4px !important;gap:6px !important}
        }
        @media(max-height:500px){
          .vc-controls{padding:6px 8px !important}
          .vc-btn{width:36px !important;height:36px !important}
        }
      `}</style>

      {/* Video area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div className="vc-video-area" style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Pinned view - only remote */}
          {pinnedId && (
            <div style={{ flex: 1, minHeight: 0 }}>
              <VideoTile participantId={pinnedId} isLocal={false} isPinned onPin={() => setPinned(null)} />
            </div>
          )}
          {/* Grid / Thumbnails */}
          <div className="vc-video-grid" style={{ display: 'grid', gridTemplateColumns: pinnedId ? `repeat(${Math.min(gridIds.length, 4)}, 1fr)` : gridIds.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', gap: 8, ...(pinnedId ? { height: 100, flexShrink: 0 } : { flex: 1 }) }}>
            {gridIds.map(id => (
              <VideoTile key={id} participantId={id} isLocal={id === localParticipant?.id} isPinned={false} onPin={(pid) => { if (pid !== localParticipant?.id) setPinned(pid); }} />
            ))}
          </div>
          {participantIds.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46' }}>
              <p>Connecting...</p>
            </div>
          )}
        </div>

        {/* Chat panel */}
        {/* Chat panel - always mounted for socket, hidden when closed */}
        <div className="vc-chat-panel" style={{ display: chatOpen ? 'block' : 'none' }}><ChatPanel onClose={() => setChatOpen(false)} callId={callId} agentName={userName} onNewMessage={() => { if (!chatOpen) setUnread(u => u + 1); }} /></div>
      </div>

      {/* Controls bar */}
      <div className="vc-controls" style={{ padding: '12px 16px', borderTop: '1px solid #1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button className="vc-btn" onClick={() => { toggleMic(); setMicOn(!micOn); }}
          style={{ width: 44, height: 44, background: micOn ? '#1f1f23' : '#ef4444', color: '#fff', fontSize: 18 }}>
          {micOn ? '🎤' : '🔇'}
        </button>
        <button className="vc-btn" onClick={() => { toggleWebcam(); setCamOn(!camOn); }}
          style={{ width: 44, height: 44, background: camOn ? '#1f1f23' : '#f59e0b', color: '#fff', fontSize: 18 }}>
          {camOn ? '📷' : '📷'}
        </button>
        <button className="vc-btn" onClick={() => { setChatOpen(!chatOpen); if (!chatOpen) setUnread(0); }}
          style={{ width: 44, height: 44, background: chatOpen ? '#6366f1' : '#1f1f23', color: '#fff', fontSize: 18, position: 'relative' }}>
          💬
          {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{unread}</span>}
        </button>
        <button className="vc-btn vc-btn-end" onClick={endCall}
          style={{ width: 52, height: 44, borderRadius: 22, background: '#ef4444', color: '#fff', fontSize: 16 }}>
          📞
        </button>
      </div>
    </div>
  );
}

export default function AgentCall({ token: authToken, user }) {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const videoToken = searchParams.get('token');
  const callId = searchParams.get('callId');

  if (!videoToken || !meetingId) return <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>Invalid call link</div>;

  return (
    <MeetingProvider config={{ meetingId, micEnabled: true, webcamEnabled: false, name: user?.name || 'Agent' }} token={videoToken}>
      <MeetingConsumer>
        {() => <MeetingView callId={callId} token={authToken} userName={user?.name || 'Agent'} />}
      </MeetingConsumer>
    </MeetingProvider>
  );
}
