import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MeetingProvider, useMeeting, useParticipant, MeetingConsumer } from '@videosdk.live/react-sdk';
import { io } from 'socket.io-client';
import { API } from '../App';

const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
const MEDIAPIPE_SRC = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js';
const MEDIAPIPE_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1';

// ──────────────────────────────────────────────────────────────────────────────
//  MediaPipe Selfie Segmentation — lazy-loaded for real background blur
// ──────────────────────────────────────────────────────────────────────────────
let mpLoadPromise = null;
function loadMediaPipe() {
  if (mpLoadPromise) return mpLoadPromise;
  mpLoadPromise = new Promise((resolve, reject) => {
    if (window.SelfieSegmentation) return resolve();
    const s = document.createElement('script');
    s.src = MEDIAPIPE_SRC;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = (e) => { mpLoadPromise = null; reject(e); };
    document.head.appendChild(s);
  });
  return mpLoadPromise;
}

async function createBlurredTrack({ deviceId, intensity = 12 } = {}) {
  await loadMediaPipe();
  const constraints = {
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
    audio: false,
  };
  if (deviceId) constraints.video.deviceId = { exact: deviceId };
  const rawStream = await navigator.mediaDevices.getUserMedia(constraints);
  const trackSettings = rawStream.getVideoTracks()[0].getSettings();
  const W = trackSettings.width || 1280;
  const H = trackSettings.height || 720;

  const video = document.createElement('video');
  video.srcObject = rawStream;
  video.muted = true; video.playsInline = true;
  await video.play();

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const seg = new window.SelfieSegmentation({ locateFile: (f) => `${MEDIAPIPE_BASE}/${f}` });
  seg.setOptions({ modelSelection: 1 });
  seg.onResults((results) => {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(results.segmentationMask, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(results.image, 0, 0, W, H);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.filter = `blur(${intensity}px)`;
    ctx.drawImage(results.image, 0, 0, W, H);
    ctx.filter = 'none';
    ctx.restore();
  });

  let active = true;
  const tick = async () => {
    if (!active) return;
    if (video.readyState >= 2) { try { await seg.send({ image: video }); } catch (e) {} }
    if (active) requestAnimationFrame(tick);
  };
  tick();

  const outStream = canvas.captureStream(30);
  const outTrack = outStream.getVideoTracks()[0];
  outTrack._teardown = () => {
    active = false;
    rawStream.getTracks().forEach(t => t.stop());
    try { seg.close(); } catch (e) {}
  };
  outTrack._deviceId = trackSettings.deviceId;
  return outTrack;
}

// ──────────────────────────────────────────────────────────────────────────────
//  SVG Icons (no emoji — clean professional set)
// ──────────────────────────────────────────────────────────────────────────────
const ICONS = {
  mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
  micOff: <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
  cam: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
  camOff: <><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  hang: <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  people: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  minimize: <><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></>,
  expand: <><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>,
  pip: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><rect x="13" y="11" width="7" height="5" rx="1"/></>,
  share: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  more: <><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="19" r="1.4"/></>,
  grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  spot: <><rect x="3" y="3" width="18" height="13" rx="2"/><line x1="3" y1="20" x2="9" y2="20"/><line x1="12" y1="20" x2="18" y2="20"/></>,
  sparkles: <><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="M19 14l.9 2.6L22 18l-2.1.4L19 21l-.9-2.6L16 18l2.1-1.4z"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  flip: <><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></>,
  pin: <><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></>,
  signal: <><line x1="4" y1="20" x2="4" y2="17"/><line x1="9" y1="20" x2="9" y2="13"/><line x1="14" y1="20" x2="14" y2="9"/><line x1="19" y1="20" x2="19" y2="5"/></>,
  chev: <polyline points="6 9 12 15 18 9"/>,
  check: <polyline points="20 6 9 17 4 12"/>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  fullscreen: <><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></>,
};

const Icon = ({ name, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    {ICONS[name]}
  </svg>
);

// ──────────────────────────────────────────────────────────────────────────────
//  Timer hook
// ──────────────────────────────────────────────────────────────────────────────
function useCallTimer(active = true) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(i);
  }, [active]);
  const hh = Math.floor(secs / 3600);
  const mm = Math.floor((secs % 3600) / 60);
  const ss = secs % 60;
  return hh > 0 ? `${hh}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}` : `${mm}:${String(ss).padStart(2,'0')}`;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Draggable hook for the minimized floating widget
// ──────────────────────────────────────────────────────────────────────────────
function useDraggable(initial = { x: 24, y: 24 }) {
  const [pos, setPos] = useState(initial);
  const dragRef = useRef({ active: false, ox: 0, oy: 0, sx: 0, sy: 0 });

  const onPointerDown = useCallback((e) => {
    const target = e.currentTarget;
    if (e.target !== target && !e.target.closest('.vc-drag-handle')) return;
    dragRef.current = { active: true, ox: pos.x, oy: pos.y, sx: e.clientX, sy: e.clientY };
    target.setPointerCapture?.(e.pointerId);
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.sx;
      const dy = e.clientY - dragRef.current.sy;
      const W = window.innerWidth, H = window.innerHeight;
      setPos({
        x: Math.max(8, Math.min(W - 320, dragRef.current.ox + dx)),
        y: Math.max(8, Math.min(H - 220, dragRef.current.oy + dy)),
      });
    };
    const onUp = () => { dragRef.current.active = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, []);

  return { pos, onPointerDown };
}

// ──────────────────────────────────────────────────────────────────────────────
//  Video Tile
// ──────────────────────────────────────────────────────────────────────────────
function VideoTile({ participantId, isLocal, isMain, onPin, pinned, compact, onVideoRef }) {
  const { webcamStream, webcamOn, micOn, micStream, displayName } = useParticipant(participantId);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const s = new MediaStream(); s.addTrack(webcamStream.track);
      videoRef.current.srcObject = s;
      if (onVideoRef && !isLocal) onVideoRef(videoRef.current);
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micStream && audioRef.current && !isLocal) {
      const s = new MediaStream(); s.addTrack(micStream.track);
      audioRef.current.srcObject = s;
    }
  }, [micStream, isLocal]);

  const initial = (displayName || '?').trim()[0]?.toUpperCase() || '?';

  return (
    <div onDoubleClick={() => onPin && !isLocal && onPin(participantId)} className={`vc-tile ${isMain ? 'vc-tile-main' : ''} ${pinned ? 'vc-tile-pinned' : ''} ${compact ? 'vc-tile-compact' : ''}`}>
      {!isLocal && <audio ref={audioRef} autoPlay />}
      {webcamOn ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isLocal ? 'scaleX(-1)' : 'none' }} />
      ) : (
        <div className="vc-tile-avatar-wrap">
          <div className="vc-tile-avatar" style={{ width: isMain ? 96 : 52, height: isMain ? 96 : 52, fontSize: isMain ? 36 : 18 }}>{initial}</div>
          {isMain && <p className="vc-tile-avatar-name">{displayName}</p>}
        </div>
      )}
      <div className="vc-tile-label">
        <span className="vc-tile-name">{displayName || 'Guest'}{isLocal ? ' (You)' : ''}</span>
        <div className="vc-tile-badges">
          {pinned && <span className="vc-tile-badge vc-tile-badge-pin"><Icon name="pin" size={11}/></span>}
          {!micOn && <span className="vc-tile-badge vc-tile-badge-mute"><Icon name="micOff" size={11}/></span>}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  Chat panel
// ──────────────────────────────────────────────────────────────────────────────
function ChatPanel({ callId, agentName, onClose, onNewMessage }) {
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
      onNewMessage?.();
    });
    fetch(`${API}/chat/${callId}`).then(r => r.json()).then(history => {
      setMessages(history.map(m => ({ ...m, isMe: m.senderRole === 'agent' })));
    }).catch(() => {});
    return () => s.disconnect();
  }, [callId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    const text = msg.trim();
    if (!text) return;
    socketRef.current?.emit('chat-message', { callId, sender: agentName, senderRole: 'agent', message: text });
    setMessages(prev => [...prev, { sender: 'You', message: text, isMe: true, createdAt: new Date() }]);
    setMsg('');
  };

  const linkify = (text) => text.split(/(\bhttps?:\/\/\S+)/g).map((p, i) =>
    /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="vc-msg-link">{p}</a> : p
  );

  return (
    <aside className="vc-chat">
      <header className="vc-chat-head">
        <div>
          <h3>Chat</h3>
          <p>Share product links, prices, anything</p>
        </div>
        <button onClick={onClose} className="vc-icon-btn" title="Close"><Icon name="close" size={16}/></button>
      </header>
      <div className="vc-chat-body">
        {messages.length === 0 && (
          <div className="vc-chat-empty">
            <Icon name="chat" size={22}/>
            <p>No messages yet</p>
            <span>Send links, coupons, or product details</span>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`vc-msg-row ${m.isMe ? 'vc-msg-row-me' : ''}`}>
            {!m.isMe && <span className="vc-msg-from">{m.sender}</span>}
            <div className={`vc-msg-bubble ${m.isMe ? 'vc-msg-mine' : 'vc-msg-theirs'}`}>
              {linkify(m.message)}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div className="vc-chat-input">
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..."/>
        <button onClick={send} disabled={!msg.trim()}><Icon name="send" size={15}/></button>
      </div>
    </aside>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  Control button + Device popover
// ──────────────────────────────────────────────────────────────────────────────
function Ctrl({ icon, label, onClick, active, danger, badge, hasChevron, onChevron }) {
  return (
    <div className="vc-ctrl-wrap">
      <button onClick={onClick} className={`vc-ctrl ${active ? 'vc-ctrl-active' : ''} ${danger ? 'vc-ctrl-danger' : ''}`} title={label}>
        <Icon name={icon} size={20}/>
        {badge > 0 && <span className="vc-ctrl-badge">{badge}</span>}
      </button>
      {hasChevron && (
        <button onClick={onChevron} className="vc-ctrl-chev" title={`${label} options`}>
          <Icon name="chev" size={11}/>
        </button>
      )}
      <span className="vc-ctrl-label">{label}</span>
    </div>
  );
}

function DevicePopover({ open, onClose, items, current, onSelect, title }) {
  if (!open) return null;
  return (
    <div className="vc-popover" onClick={(e) => e.stopPropagation()}>
      <div className="vc-popover-head">{title}</div>
      {items.length === 0 && <div className="vc-popover-empty">No devices found</div>}
      {items.map(it => (
        <button key={it.deviceId} className={`vc-popover-item ${current === it.deviceId ? 'is-active' : ''}`} onClick={() => { onSelect(it.deviceId); onClose(); }}>
          <span>{it.label || 'Unnamed device'}</span>
          {current === it.deviceId && <Icon name="check" size={14}/>}
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  Toast
// ──────────────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(t => t?.id && Date.now() - t.id > 2900 ? null : t), 3000);
  }, []);
  return [toast, show];
}

// ──────────────────────────────────────────────────────────────────────────────
//  Main Meeting View
// ──────────────────────────────────────────────────────────────────────────────
function MeetingView({ callId, token: authToken, userName }) {
  const navigate = useNavigate();
  const [pinnedId, setPinnedId] = useState(null);
  const [layout, setLayout] = useState('spotlight'); // 'spotlight' | 'grid'
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [blurOn, setBlurOn] = useState(false);
  const [blurLoading, setBlurLoading] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [micMenuOpen, setMicMenuOpen] = useState(false);
  const [camMenuOpen, setCamMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mics, setMics] = useState([]);
  const [cams, setCams] = useState([]);
  const [activeMicId, setActiveMicId] = useState();
  const [activeCamId, setActiveCamId] = useState();
  const [toast, showToast] = useToast();
  const joinedRef = useRef(false);
  const blurTrackRef = useRef(null);
  const mainVideoElRef = useRef(null);

  const timer = useCallTimer(true);
  const { pos: minPos, onPointerDown: onMinDown } = useDraggable({ x: window.innerWidth - 340, y: window.innerHeight - 240 });

  const endCall = async () => {
    try { leave(); } catch (e) {}
    blurTrackRef.current?._teardown?.();
    if (callId) {
      await fetch(`${API}/video/end-call`, {
        method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      }).catch(() => {});
    }
    navigate('/dashboard');
  };

  const { participants, leave, toggleMic, toggleWebcam, toggleScreenShare, changeWebcam, changeMic, enableWebcam, disableWebcam, getWebcams, getMics, localParticipant, join, presenterId } = useMeeting({
    onMeetingJoined: () => {},
    onParticipantLeft: () => { showToast('Customer left the call', 'warn'); setTimeout(endCall, 1200); },
    onMeetingLeft: () => navigate('/dashboard'),
    onError: (err) => showToast(err?.message || 'Connection error', 'error'),
  });

  useEffect(() => {
    if (!joinedRef.current) {
      joinedRef.current = true;
      setTimeout(() => join(), 400);
    }
  }, []);

  // Load device list once permissions are granted
  useEffect(() => {
    const load = async () => {
      try {
        const [m, c] = await Promise.all([getMics?.() || [], getWebcams?.() || []]);
        setMics(Array.isArray(m) ? m : []);
        setCams(Array.isArray(c) ? c : []);
      } catch (e) {}
    };
    load();
    const i = setInterval(load, 4000);
    return () => clearInterval(i);
  }, []);

  // Auto Picture-in-Picture when the tab becomes hidden
  useEffect(() => {
    const onVis = async () => {
      const v = mainVideoElRef.current;
      if (!v || !v.srcObject) return;
      if (document.hidden) {
        if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
          try { await v.requestPictureInPicture(); setPipActive(true); } catch (e) {}
        }
      } else if (document.pictureInPictureElement === v) {
        try { await document.exitPictureInPicture(); setPipActive(false); } catch (e) {}
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Track PiP state from browser events
  useEffect(() => {
    const onEnter = () => setPipActive(true);
    const onLeave = () => setPipActive(false);
    document.addEventListener('enterpictureinpicture', onEnter);
    document.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      document.removeEventListener('enterpictureinpicture', onEnter);
      document.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, []);

  const togglePiP = async () => {
    const v = mainVideoElRef.current;
    if (!v) { showToast('No video to pop out', 'warn'); return; }
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch (e) { showToast('Picture-in-Picture unavailable', 'error'); }
  };

  const onToggleMic = () => { toggleMic(); setMicOn(v => !v); };
  const onToggleCam = async () => {
    if (blurOn) {
      // Disable blur on cam off
      blurTrackRef.current?._teardown?.();
      blurTrackRef.current = null;
      setBlurOn(false);
    }
    toggleWebcam();
    setCamOn(v => !v);
  };

  const onToggleScreen = async () => {
    try { await toggleScreenShare(); setScreenOn(v => !v); }
    catch (e) { showToast('Screen share denied', 'error'); }
  };

  const onSwitchMic = async (deviceId) => {
    try { await changeMic(deviceId); setActiveMicId(deviceId); }
    catch (e) { showToast('Could not switch mic', 'error'); }
  };

  const applyCustomTrack = async (track) => {
    try { return await changeWebcam({ customTrack: track }); } catch (e) {}
    try { return await changeWebcam(track); } catch (e) {}
    try { disableWebcam?.(); await new Promise(r => setTimeout(r, 250)); return enableWebcam?.(track); } catch (e) { throw e; }
  };

  const applyDeviceId = async (deviceId) => {
    try { return await changeWebcam(deviceId); } catch (e) {}
    try { return await changeWebcam({ deviceId }); } catch (e) { throw e; }
  };

  const onSwitchCam = async (deviceId) => {
    try {
      if (blurOn) {
        const old = blurTrackRef.current;
        const track = await createBlurredTrack({ deviceId });
        blurTrackRef.current = track;
        await applyCustomTrack(track);
        old?._teardown?.();
      } else {
        await applyDeviceId(deviceId);
      }
      setActiveCamId(deviceId);
    } catch (e) { showToast('Could not switch camera', 'error'); }
  };

  const onFlipCamera = async () => {
    if (cams.length < 2) { showToast('Only one camera detected', 'warn'); return; }
    const current = activeCamId || cams[0]?.deviceId;
    const next = cams.find(c => c.deviceId !== current) || cams[0];
    if (next) await onSwitchCam(next.deviceId);
  };

  const onToggleBlur = async () => {
    if (blurLoading) return;
    if (blurOn) {
      blurTrackRef.current?._teardown?.();
      blurTrackRef.current = null;
      try { if (activeCamId) await applyDeviceId(activeCamId); } catch (e) {}
      setBlurOn(false);
      showToast('Background blur off', 'info');
      return;
    }
    setBlurLoading(true);
    try {
      if (!camOn) { toggleWebcam(); setCamOn(true); }
      const track = await createBlurredTrack({ deviceId: activeCamId });
      blurTrackRef.current = track;
      await applyCustomTrack(track);
      setBlurOn(true);
      showToast('Background blur on', 'success');
    } catch (e) {
      console.error('[ShopCall] Blur error:', e);
      showToast('Blur unavailable — check camera permissions', 'error');
    } finally {
      setBlurLoading(false);
    }
  };

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const copyCallLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    showToast('Call link copied', 'success');
  };

  const participantIds = useMemo(() => [...participants.keys()], [participants]);
  const remoteIds = useMemo(() => participantIds.filter(id => id !== localParticipant?.id), [participantIds, localParticipant]);
  const effectivePinned = pinnedId && remoteIds.includes(pinnedId) ? pinnedId : (remoteIds[0] || null);
  const isGrid = layout === 'grid';

  return (
    <div className={`vc-root ${minimized ? 'vc-minimized' : ''}`} style={minimized ? { left: minPos.x, top: minPos.y } : {}} onPointerDown={minimized ? onMinDown : undefined}>
      <Styles />

      {/* Top status bar — hidden when minimized */}
      {!minimized && (
        <header className="vc-top">
          <div className="vc-top-left">
            <div className="vc-logo">
              <span className="vc-logo-dot"/>
              <span>ShopCall</span>
            </div>
            <div className="vc-divider"/>
            <div className="vc-status">
              <span className="vc-status-dot"/>
              <span className="vc-status-text">Live · {timer}</span>
            </div>
            <div className="vc-quality" title="Connection">
              <Icon name="signal" size={14}/>
              <span>HD</span>
            </div>
          </div>
          <div className="vc-top-right">
            <button className="vc-pill vc-pill-ghost" onClick={copyCallLink}><Icon name="copy" size={13}/>Copy link</button>
            <button className="vc-pill vc-pill-ghost" onClick={enterFullscreen} title="Fullscreen"><Icon name="fullscreen" size={13}/></button>
          </div>
        </header>
      )}

      {/* Stage area */}
      <div className={`vc-stage ${chatOpen && !minimized ? 'vc-stage-with-chat' : ''}`}>
        <div className="vc-stage-inner">
          {participantIds.length === 0 ? (
            <div className="vc-connecting">
              <div className="vc-spinner"/>
              <p>Connecting to your customer…</p>
            </div>
          ) : isGrid ? (
            <div className={`vc-grid vc-grid-${Math.min(participantIds.length, 4)}`}>
              {participantIds.map(id => (
                <VideoTile key={id} participantId={id} isLocal={id === localParticipant?.id}
                  pinned={id === effectivePinned} onPin={setPinnedId}
                  onVideoRef={(el) => { if (id === effectivePinned) mainVideoElRef.current = el; }}
                  isMain/>
              ))}
            </div>
          ) : (
            <>
              {effectivePinned && (
                <div className="vc-main-tile">
                  <VideoTile participantId={effectivePinned} isLocal={false} isMain pinned
                    onPin={() => setPinnedId(null)}
                    onVideoRef={(el) => { mainVideoElRef.current = el; }}/>
                </div>
              )}
              {/* Thumbnail strip */}
              <div className="vc-thumbs">
                {participantIds.filter(id => id !== effectivePinned).map(id => (
                  <div key={id} className="vc-thumb"><VideoTile participantId={id} isLocal={id === localParticipant?.id} onPin={setPinnedId}/></div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chat */}
        {chatOpen && !minimized && (
          <ChatPanel callId={callId} agentName={userName}
            onClose={() => setChatOpen(false)}
            onNewMessage={() => { if (!chatOpen) setUnread(u => u + 1); }}/>
        )}
      </div>

      {/* Control bar */}
      {!minimized && (
        <footer className="vc-bottom" onClick={() => { setMicMenuOpen(false); setCamMenuOpen(false); setMoreMenuOpen(false); }}>
          <div className="vc-bottom-left">
            <div className="vc-call-info">
              <span className="vc-call-info-name">Customer call</span>
              <span className="vc-call-info-meta">{participantIds.length} participant{participantIds.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="vc-bottom-center" onClick={(e) => e.stopPropagation()}>
            <div className="vc-ctrl-wrap">
              <button onClick={onToggleMic} className={`vc-ctrl ${micOn ? 'vc-ctrl-active' : 'vc-ctrl-danger'}`} title="Mic">
                <Icon name={micOn ? 'mic' : 'micOff'} size={20}/>
              </button>
              {mics.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); setMicMenuOpen(v => !v); setCamMenuOpen(false); }} className="vc-ctrl-chev" title="Audio options"><Icon name="chev" size={11}/></button>
              )}
              <DevicePopover open={micMenuOpen} onClose={() => setMicMenuOpen(false)} items={mics} current={activeMicId} onSelect={onSwitchMic} title="Microphone"/>
              <span className="vc-ctrl-label">Mic</span>
            </div>

            <div className="vc-ctrl-wrap">
              <button onClick={onToggleCam} className={`vc-ctrl ${camOn ? 'vc-ctrl-active' : 'vc-ctrl-danger'}`} title="Camera">
                <Icon name={camOn ? 'cam' : 'camOff'} size={20}/>
              </button>
              {cams.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); setCamMenuOpen(v => !v); setMicMenuOpen(false); }} className="vc-ctrl-chev" title="Camera options"><Icon name="chev" size={11}/></button>
              )}
              <DevicePopover open={camMenuOpen} onClose={() => setCamMenuOpen(false)} items={cams} current={activeCamId} onSelect={onSwitchCam} title="Camera"/>
              <span className="vc-ctrl-label">Camera</span>
            </div>

            <div className="vc-ctrl-wrap">
              <button onClick={onFlipCamera} className="vc-ctrl" title="Flip camera"><Icon name="flip" size={18}/></button>
              <span className="vc-ctrl-label">Flip</span>
            </div>

            <div className="vc-ctrl-wrap">
              <button onClick={onToggleBlur} className={`vc-ctrl ${blurOn ? 'vc-ctrl-accent' : ''}`} title="Background blur" disabled={blurLoading}>
                {blurLoading ? <div className="vc-mini-spin"/> : <Icon name="sparkles" size={18}/>}
              </button>
              <span className="vc-ctrl-label">Blur</span>
            </div>

            <div className="vc-ctrl-wrap">
              <button onClick={onToggleScreen} className={`vc-ctrl ${screenOn ? 'vc-ctrl-accent' : ''}`} title="Share screen"><Icon name="share" size={18}/></button>
              <span className="vc-ctrl-label">Share</span>
            </div>

            <div className="vc-ctrl-wrap">
              <button onClick={() => { setChatOpen(v => !v); if (!chatOpen) setUnread(0); }} className={`vc-ctrl ${chatOpen ? 'vc-ctrl-accent' : ''}`} title="Chat">
                <Icon name="chat" size={18}/>
                {unread > 0 && !chatOpen && <span className="vc-ctrl-badge">{unread}</span>}
              </button>
              <span className="vc-ctrl-label">Chat</span>
            </div>

            <div className="vc-ctrl-wrap">
              <button onClick={() => setLayout(l => l === 'grid' ? 'spotlight' : 'grid')} className="vc-ctrl" title="Layout">
                <Icon name={isGrid ? 'spot' : 'grid'} size={18}/>
              </button>
              <span className="vc-ctrl-label">{isGrid ? 'Spotlight' : 'Grid'}</span>
            </div>

            <div className="vc-ctrl-wrap" style={{ position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setMoreMenuOpen(v => !v); }} className="vc-ctrl" title="More"><Icon name="more" size={18}/></button>
              <span className="vc-ctrl-label">More</span>
              {moreMenuOpen && (
                <div className="vc-popover vc-popover-up" onClick={(e) => e.stopPropagation()}>
                  <button className="vc-popover-item" onClick={() => { togglePiP(); setMoreMenuOpen(false); }}>
                    <Icon name="pip" size={14}/><span>{pipActive ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}</span>
                  </button>
                  <button className="vc-popover-item" onClick={() => { setMinimized(true); setMoreMenuOpen(false); }}>
                    <Icon name="minimize" size={14}/><span>Minimize</span>
                  </button>
                  <button className="vc-popover-item" onClick={() => { enterFullscreen(); setMoreMenuOpen(false); }}>
                    <Icon name="fullscreen" size={14}/><span>Fullscreen</span>
                  </button>
                  <button className="vc-popover-item" onClick={() => { copyCallLink(); setMoreMenuOpen(false); }}>
                    <Icon name="copy" size={14}/><span>Copy call link</span>
                  </button>
                </div>
              )}
            </div>

            <div className="vc-ctrl-wrap">
              <button onClick={endCall} className="vc-ctrl vc-ctrl-hang" title="End call"><Icon name="hang" size={20}/></button>
              <span className="vc-ctrl-label">End</span>
            </div>
          </div>

          <div className="vc-bottom-right" />
        </footer>
      )}

      {/* Minimized chrome */}
      {minimized && (
        <div className="vc-min-chrome vc-drag-handle">
          <span className="vc-min-name">Live call · {timer}</span>
          <div className="vc-min-actions">
            <button onClick={onToggleMic} className="vc-min-btn" title="Mic"><Icon name={micOn ? 'mic' : 'micOff'} size={13}/></button>
            <button onClick={onToggleCam} className="vc-min-btn" title="Camera"><Icon name={camOn ? 'cam' : 'camOff'} size={13}/></button>
            <button onClick={() => setMinimized(false)} className="vc-min-btn" title="Expand"><Icon name="expand" size={13}/></button>
            <button onClick={endCall} className="vc-min-btn vc-min-btn-danger" title="End"><Icon name="hang" size={13}/></button>
          </div>
        </div>
      )}

      {toast && <div className={`vc-toast vc-toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  Styles
// ──────────────────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .vc-root{position:fixed;inset:0;display:flex;flex-direction:column;background:radial-gradient(1200px 800px at 20% 0%,rgba(99,102,241,.10),transparent 60%),radial-gradient(900px 700px at 90% 100%,rgba(168,85,247,.08),transparent 60%),#070710;color:#f4f4f5;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-feature-settings:'cv11','ss01';overflow:hidden;animation:vcEnter .35s cubic-bezier(.4,0,.2,1)}
      @keyframes vcEnter{from{opacity:0}to{opacity:1}}
      .vc-root.vc-minimized{position:fixed;inset:auto;width:320px;height:200px;border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);cursor:move;transition:none;background:#0a0a12}
      .vc-root.vc-minimized .vc-stage{padding:0}
      .vc-root.vc-minimized .vc-stage-inner{padding:0}
      .vc-root.vc-minimized .vc-main-tile{height:100%;border-radius:0}
      .vc-root.vc-minimized .vc-tile-label{font-size:10px;padding:6px 8px}
      .vc-root.vc-minimized .vc-thumbs{display:none}

      /* ── Top bar ── */
      .vc-top{display:flex;justify-content:space-between;align-items:center;padding:14px 22px;background:linear-gradient(180deg,rgba(10,10,18,.85),rgba(10,10,18,0));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:5}
      .vc-top-left{display:flex;align-items:center;gap:14px}
      .vc-top-right{display:flex;align-items:center;gap:8px}
      .vc-logo{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;letter-spacing:-.2px}
      .vc-logo-dot{width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a78bfa);box-shadow:0 0 12px rgba(99,102,241,.6)}
      .vc-divider{width:1px;height:18px;background:rgba(255,255,255,.08)}
      .vc-status{display:flex;align-items:center;gap:7px;font-size:13px;color:#a1a1aa}
      .vc-status-dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 10px rgba(16,185,129,.6);animation:vcPulse 2s ease-in-out infinite}
      @keyframes vcPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.9)}}
      .vc-status-text{font-variant-numeric:tabular-nums;font-weight:500;color:#f4f4f5}
      .vc-quality{display:flex;align-items:center;gap:5px;font-size:11px;color:#71717a;background:rgba(255,255,255,.04);padding:5px 9px;border-radius:7px;border:1px solid rgba(255,255,255,.06)}
      .vc-quality span{font-weight:600;color:#10b981}
      .vc-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#d4d4d8;font-size:12px;font-weight:500;padding:7px 11px;border-radius:9px;cursor:pointer;transition:all .15s}
      .vc-pill:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);color:#fff}

      /* ── Stage ── */
      .vc-stage{flex:1;display:flex;min-height:0;padding:6px 16px 0;gap:12px}
      .vc-stage-inner{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
      .vc-stage-with-chat .vc-stage-inner{flex:1}

      .vc-main-tile{flex:1;min-height:0;position:relative;border-radius:18px;overflow:hidden;background:#13131a;box-shadow:0 18px 48px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.04) inset}
      .vc-thumbs{display:flex;gap:8px;height:96px;flex-shrink:0;overflow-x:auto;padding-bottom:2px}
      .vc-thumb{width:130px;height:96px;flex-shrink:0;border-radius:12px;overflow:hidden;background:#13131a;border:1px solid rgba(255,255,255,.06);transition:transform .15s,border-color .15s}
      .vc-thumb:hover{transform:translateY(-2px);border-color:rgba(99,102,241,.4)}
      .vc-thumb .vc-tile{height:100%;border-radius:12px}

      .vc-grid{flex:1;display:grid;gap:10px}
      .vc-grid-1{grid-template-columns:1fr}
      .vc-grid-2{grid-template-columns:repeat(2,1fr)}
      .vc-grid-3{grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(2,1fr)}
      .vc-grid-4{grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(2,1fr)}

      /* ── Tile ── */
      .vc-tile{position:relative;width:100%;height:100%;border-radius:inherit;overflow:hidden;background:linear-gradient(135deg,#13131a,#0e0e16);transition:transform .25s cubic-bezier(.4,0,.2,1)}
      .vc-tile-main{border-radius:18px}
      .vc-tile-pinned{outline:2px solid rgba(99,102,241,.6);outline-offset:-2px}
      .vc-tile-avatar-wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(400px 280px at 50% 40%,rgba(99,102,241,.18),transparent 60%)}
      .vc-tile-avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;background:linear-gradient(135deg,#6366f1,#a78bfa);box-shadow:0 14px 32px rgba(99,102,241,.4),0 0 0 4px rgba(255,255,255,.04)}
      .vc-tile-avatar-name{font-size:14px;color:#a1a1aa;font-weight:500}
      .vc-tile-label{position:absolute;left:10px;bottom:10px;display:flex;align-items:center;gap:6px;background:rgba(10,10,18,.65);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:5px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.06);font-size:11px;font-weight:500;letter-spacing:.1px;color:#f4f4f5}
      .vc-tile-name{max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .vc-tile-badges{display:flex;gap:4px}
      .vc-tile-badge{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px}
      .vc-tile-badge-mute{background:rgba(239,68,68,.85);color:#fff}
      .vc-tile-badge-pin{background:rgba(99,102,241,.85);color:#fff}

      /* ── Connecting ── */
      .vc-connecting{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#a1a1aa}
      .vc-spinner{width:34px;height:34px;border:3px solid rgba(255,255,255,.08);border-top-color:#6366f1;border-radius:50%;animation:vcSpin .9s linear infinite}
      @keyframes vcSpin{to{transform:rotate(360deg)}}
      .vc-mini-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.18);border-top-color:#fff;border-radius:50%;animation:vcSpin .8s linear infinite}

      /* ── Chat ── */
      .vc-chat{width:340px;flex-shrink:0;display:flex;flex-direction:column;background:rgba(15,15,22,.82);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin-bottom:8px;overflow:hidden;animation:vcSlide .25s cubic-bezier(.4,0,.2,1)}
      @keyframes vcSlide{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
      .vc-chat-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06)}
      .vc-chat-head h3{font-size:13px;font-weight:600;letter-spacing:-.1px}
      .vc-chat-head p{font-size:11px;color:#71717a;margin-top:2px}
      .vc-icon-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.06);background:transparent;color:#a1a1aa;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
      .vc-icon-btn:hover{background:rgba(255,255,255,.06);color:#fff}
      .vc-chat-body{flex:1;overflow-y:auto;padding:14px 14px 4px;display:flex;flex-direction:column;gap:10px}
      .vc-chat-body::-webkit-scrollbar{width:6px}
      .vc-chat-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
      .vc-chat-empty{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:#52525b;padding:30px 20px}
      .vc-chat-empty p{font-size:13px;color:#a1a1aa;font-weight:500}
      .vc-chat-empty span{font-size:11px;color:#52525b}
      .vc-msg-row{display:flex;flex-direction:column;max-width:88%}
      .vc-msg-row-me{align-self:flex-end;align-items:flex-end}
      .vc-msg-from{font-size:10px;color:#52525b;margin-bottom:3px;padding:0 4px}
      .vc-msg-bubble{padding:8px 12px;font-size:13px;line-height:1.4;border-radius:14px;word-break:break-word;animation:vcMsgIn .2s ease}
      @keyframes vcMsgIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
      .vc-msg-theirs{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.04);color:#f4f4f5;border-bottom-left-radius:4px}
      .vc-msg-mine{background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;border-bottom-right-radius:4px;box-shadow:0 8px 22px rgba(99,102,241,.25)}
      .vc-msg-link{color:#fff;text-decoration:underline;text-underline-offset:2px}
      .vc-chat-input{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.18)}
      .vc-chat-input input{flex:1;padding:10px 12px;border-radius:9px;border:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.3);color:#fff;font-size:13px;outline:none;transition:border .15s,box-shadow .15s;font-family:inherit}
      .vc-chat-input input:focus{border-color:rgba(99,102,241,.6);box-shadow:0 0 0 3px rgba(99,102,241,.12)}
      .vc-chat-input button{border:none;border-radius:9px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;padding:0 14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-weight:600}
      .vc-chat-input button:disabled{opacity:.4;cursor:not-allowed}
      .vc-chat-input button:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(99,102,241,.4)}

      /* ── Control bar ── */
      .vc-bottom{display:flex;align-items:center;justify-content:space-between;padding:16px 22px 20px;gap:16px;background:linear-gradient(0deg,rgba(7,7,16,.95),rgba(7,7,16,.6));position:relative;z-index:6}
      .vc-bottom-left,.vc-bottom-right{flex:1;display:flex;align-items:center;min-width:0}
      .vc-bottom-right{justify-content:flex-end}
      .vc-call-info{display:flex;flex-direction:column;gap:1px}
      .vc-call-info-name{font-size:13px;font-weight:600;color:#f4f4f5}
      .vc-call-info-meta{font-size:11px;color:#71717a}
      .vc-bottom-center{display:flex;align-items:center;gap:14px;padding:10px 16px;background:rgba(20,20,28,.78);backdrop-filter:blur(28px) saturate(1.4);-webkit-backdrop-filter:blur(28px) saturate(1.4);border:1px solid rgba(255,255,255,.06);border-radius:22px;box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.02) inset}

      .vc-ctrl-wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px}
      .vc-ctrl{width:46px;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.04);color:#f4f4f5;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s cubic-bezier(.4,0,.2,1);position:relative}
      .vc-ctrl:hover:not(:disabled){background:rgba(255,255,255,.10);transform:translateY(-1px)}
      .vc-ctrl:active{transform:translateY(0)}
      .vc-ctrl-active{background:rgba(255,255,255,.10)}
      .vc-ctrl-accent{background:linear-gradient(135deg,rgba(99,102,241,.9),rgba(124,58,237,.9));border-color:transparent;box-shadow:0 8px 22px rgba(99,102,241,.35)}
      .vc-ctrl-accent:hover:not(:disabled){box-shadow:0 12px 26px rgba(99,102,241,.45)}
      .vc-ctrl-danger{background:linear-gradient(135deg,#ef4444,#dc2626);border-color:transparent;color:#fff;box-shadow:0 8px 22px rgba(239,68,68,.3)}
      .vc-ctrl-hang{width:64px;background:linear-gradient(135deg,#ef4444,#b91c1c);border-color:transparent;color:#fff;box-shadow:0 10px 26px rgba(239,68,68,.45)}
      .vc-ctrl-hang:hover{transform:translateY(-1px) scale(1.02);box-shadow:0 14px 30px rgba(239,68,68,.55)}
      .vc-ctrl-chev{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;border:none;background:#1e1e29;color:#a1a1aa;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;box-shadow:0 4px 10px rgba(0,0,0,.5)}
      .vc-ctrl-chev:hover{background:#2a2a38;color:#fff}
      .vc-ctrl-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
      .vc-ctrl-label{font-size:10px;color:#71717a;font-weight:500;letter-spacing:.2px}
      .vc-ctrl:disabled{opacity:.6;cursor:not-allowed}

      /* ── Popovers ── */
      .vc-popover{position:absolute;bottom:calc(100% + 12px);left:50%;transform:translateX(-50%);min-width:220px;max-width:300px;background:rgba(22,22,30,.96);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:6px;box-shadow:0 24px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.02) inset;z-index:20;animation:vcPop .15s ease}
      @keyframes vcPop{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      .vc-popover-up{bottom:calc(100% + 12px)}
      .vc-popover-head{padding:8px 12px 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#71717a}
      .vc-popover-empty{padding:14px;color:#52525b;font-size:12px;text-align:center}
      .vc-popover-item{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:9px 12px;border:none;background:transparent;color:#d4d4d8;font-size:13px;border-radius:8px;cursor:pointer;text-align:left;transition:background .12s}
      .vc-popover-item span{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
      .vc-popover-item:hover{background:rgba(255,255,255,.06);color:#fff}
      .vc-popover-item.is-active{color:#a5b4fc}

      /* ── Minimized chrome ── */
      .vc-min-chrome{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);z-index:10;font-size:11px;font-weight:600;color:#f4f4f5;cursor:move}
      .vc-min-name{font-variant-numeric:tabular-nums}
      .vc-min-actions{display:flex;gap:4px}
      .vc-min-btn{width:26px;height:26px;border-radius:7px;border:none;background:rgba(255,255,255,.12);backdrop-filter:blur(8px);color:#f4f4f5;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .12s}
      .vc-min-btn:hover{background:rgba(255,255,255,.2)}
      .vc-min-btn-danger{background:rgba(239,68,68,.85)}
      .vc-min-btn-danger:hover{background:#ef4444}

      /* ── Toast ── */
      .vc-toast{position:fixed;bottom:120px;left:50%;transform:translateX(-50%);padding:11px 18px;border-radius:11px;font-size:13px;font-weight:500;background:rgba(22,22,30,.96);border:1px solid rgba(255,255,255,.08);color:#f4f4f5;backdrop-filter:blur(20px);box-shadow:0 18px 48px rgba(0,0,0,.5);z-index:50;animation:vcToast .25s cubic-bezier(.4,0,.2,1)}
      @keyframes vcToast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      .vc-toast-success{border-color:rgba(16,185,129,.4);color:#6ee7b7}
      .vc-toast-error{border-color:rgba(239,68,68,.4);color:#fca5a5}
      .vc-toast-warn{border-color:rgba(245,158,11,.4);color:#fcd34d}

      /* ── Responsive ── */
      @media(max-width:900px){
        .vc-bottom-left,.vc-bottom-right{display:none}
        .vc-bottom-center{flex:1;justify-content:space-evenly;padding:10px 8px;gap:6px}
        .vc-ctrl{width:42px;height:42px}
        .vc-ctrl-hang{width:54px}
        .vc-ctrl-label{display:none}
        .vc-ctrl-chev{width:16px;height:16px;top:-4px;right:-4px}
        .vc-chat{position:fixed;inset:0;width:100%;border-radius:0;margin:0;z-index:30}
        .vc-stage{padding:6px 8px 0}
        .vc-top{padding:10px 14px}
        .vc-top-right{gap:6px}
        .vc-pill{padding:6px 10px;font-size:11px}
        .vc-thumb{width:96px;height:72px}
      }
      @media(max-width:480px){
        .vc-bottom-center{gap:4px;padding:8px 4px}
        .vc-ctrl{width:38px;height:38px;border-radius:11px}
        .vc-ctrl-hang{width:48px}
        .vc-bottom{padding:10px 8px 14px}
      }
    `}</style>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  Entry
// ──────────────────────────────────────────────────────────────────────────────
export default function AgentCall({ token: authToken, user }) {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const videoToken = searchParams.get('token');
  const callId = searchParams.get('callId');

  if (!videoToken || !meetingId) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', fontFamily: "'Inter',sans-serif" }}>
        Invalid call link
      </div>
    );
  }

  return (
    <MeetingProvider config={{ meetingId, micEnabled: true, webcamEnabled: false, name: user?.name || 'Agent' }} token={videoToken}>
      <MeetingConsumer>
        {() => <MeetingView callId={callId} token={authToken} userName={user?.name || 'Agent'}/>}
      </MeetingConsumer>
    </MeetingProvider>
  );
}
