(function() {
  // ══════════════════════════════════════════════════════════════════════════
  //  ShopCall — Embeddable Live Video Commerce Widget
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[ShopCall] Loading…');
  const script = document.currentScript;
  if (!script) return console.error('[ShopCall] document.currentScript is null (loaded async/deferred)');
  const storeKey = script.getAttribute('data-store');
  const API_BASE = script.src.replace('/sdk/shopcall-sdk.js', '/api');
  if (!storeKey) return console.error('[ShopCall] data-store attribute missing');

  const btnText = script.getAttribute('data-text') || 'Live Shop';
  const btnBg = script.getAttribute('data-bg') || '#6366f1';
  const btnColor = script.getAttribute('data-color') || '#ffffff';
  const btnRadius = script.getAttribute('data-radius') || '50';
  const btnPosition = script.getAttribute('data-position') || 'bottom-right';
  const btnSize = script.getAttribute('data-size') || '14';
  const posMap = {
    'bottom-right': 'bottom:24px;right:24px',
    'bottom-left': 'bottom:24px;left:24px',
    'top-right': 'top:24px;right:24px',
    'top-left': 'top:24px;left:24px',
  };

  // ── External libs ────────────────────────────────────────────────────────
  const SOCKETIO_SRC = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
  const VIDEOSDK_SRC = 'https://sdk.videosdk.live/js-sdk/0.0.86/videosdk.js';
  const MEDIAPIPE_SRC = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js';
  const MEDIAPIPE_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some(s => s.src === src)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  loadScript(SOCKETIO_SRC);
  loadScript(VIDEOSDK_SRC);

  let mpLoaded = null;
  function loadMediaPipe() {
    if (mpLoaded) return mpLoaded;
    mpLoaded = loadScript(MEDIAPIPE_SRC);
    return mpLoaded;
  }

  // ── SVG icons ─────────────────────────────────────────────────────────────
  const SVG = {
    mic: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    micOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    cam: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    camOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    hang: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>',
    chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    sparkles: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="M19 14l.9 2.6L22 18l-2.1.4L19 21l-.9-2.6L16 18l2.1-1.4z"/></svg>',
    flip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>',
    minimize: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    expand: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    pip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="13" y="11" width="7" height="5" rx="1"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    send: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    more: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>',
    signal: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="4" y2="17"/><line x1="9" y1="20" x2="9" y2="13"/><line x1="14" y1="20" x2="14" y2="9"/><line x1="19" y1="20" x2="19" y2="5"/></svg>',
    shield: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    #sc-btn,#sc-overlay,#sc-call,#sc-toast,#sc-min-widget{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased}
    #sc-btn,#sc-overlay *,#sc-call *,#sc-min-widget *,#sc-toast{box-sizing:border-box}

    /* ── Launcher button ── */
    #sc-btn{position:fixed;${posMap[btnPosition]||posMap['bottom-right']};z-index:99998;background:${btnBg};color:${btnColor};border:none;padding:13px 22px 13px 18px;border-radius:${btnRadius}px;font-size:${btnSize}px;font-weight:600;letter-spacing:.1px;cursor:pointer;box-shadow:0 12px 28px rgba(99,102,241,.35),0 0 0 1px rgba(255,255,255,.08) inset;transition:transform .18s cubic-bezier(.4,0,.2,1),box-shadow .18s;display:inline-flex;align-items:center;gap:8px}
    #sc-btn:hover{transform:translateY(-2px);box-shadow:0 18px 36px rgba(99,102,241,.45)}
    #sc-btn .sc-btn-pulse{width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 0 0 rgba(16,185,129,.6);animation:scPing 1.6s infinite}
    @keyframes scPing{0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}70%{box-shadow:0 0 0 10px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}

    /* ── Pre-call modal ── */
    #sc-overlay{position:fixed;inset:0;z-index:100000;background:rgba(8,8,14,.7);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:20px;animation:scFade .25s ease}
    @keyframes scFade{from{opacity:0}to{opacity:1}}
    #sc-overlay.active{display:flex}
    .sc-modal{background:linear-gradient(180deg,#1a1a24,#10101a);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px;width:100%;max-width:400px;color:#f4f4f5;box-shadow:0 40px 80px rgba(0,0,0,.6);animation:scSlideUp .3s cubic-bezier(.4,0,.2,1)}
    @keyframes scSlideUp{from{opacity:0;transform:translateY(20px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
    .sc-modal-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}
    .sc-modal-icon{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#a78bfa);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 22px rgba(99,102,241,.4)}
    .sc-modal-title{font-size:17px;font-weight:600;letter-spacing:-.2px}
    .sc-modal-subtitle{font-size:12px;color:#a1a1aa;margin-top:2px}
    .sc-input-wrap{margin-bottom:10px}
    .sc-input-label{font-size:11px;font-weight:500;color:#a1a1aa;margin-bottom:5px;text-transform:uppercase;letter-spacing:.4px}
    .sc-modal input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.3);color:#fff;font-size:14px;outline:none;transition:border .15s,box-shadow .15s;font-family:inherit}
    .sc-modal input:focus{border-color:rgba(99,102,241,.6);box-shadow:0 0 0 3px rgba(99,102,241,.12)}
    .sc-modal .sc-hint{font-size:11px;color:#52525b;margin-top:6px}
    .sc-btn-primary{width:100%;padding:13px;border-radius:11px;border:none;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-top:18px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 26px rgba(99,102,241,.35);transition:all .2s cubic-bezier(.4,0,.2,1);font-family:inherit}
    .sc-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 32px rgba(99,102,241,.45)}
    .sc-btn-primary:disabled{opacity:.5;cursor:not-allowed}
    .sc-btn-ghost{width:100%;padding:10px;border:none;background:transparent;color:#a1a1aa;font-size:13px;cursor:pointer;margin-top:4px;font-family:inherit;transition:color .15s}
    .sc-btn-ghost:hover{color:#fff}
    .sc-modal-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#fca5a5;font-size:12px;padding:9px 12px;border-radius:9px;margin-top:10px;display:none}
    .sc-modal-error.active{display:block}
    .sc-trust-row{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:14px;font-size:11px;color:#71717a}
    .sc-trust-row span{display:inline-flex;align-items:center;gap:4px}

    /* ── Call screen ── */
    #sc-call{position:fixed;inset:0;z-index:100001;background:radial-gradient(1000px 700px at 20% 0%,rgba(99,102,241,.10),transparent 60%),radial-gradient(800px 600px at 90% 100%,rgba(168,85,247,.08),transparent 60%),#070710;color:#f4f4f5;display:none;flex-direction:column;overflow:hidden;animation:scFade .3s ease}
    #sc-call.active{display:flex}
    #sc-call.minimized{position:fixed;inset:auto;width:300px;height:200px;border-radius:18px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);cursor:move;background:#0a0a12;animation:scMinDrop .25s cubic-bezier(.4,0,.2,1)}
    @keyframes scMinDrop{from{transform:scale(.9);opacity:.3}to{transform:scale(1);opacity:1}}

    /* Top bar */
    #sc-top{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:linear-gradient(180deg,rgba(10,10,18,.85),rgba(10,10,18,0));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);flex-shrink:0;z-index:5}
    #sc-call.minimized #sc-top{display:none}
    .sc-top-left{display:flex;align-items:center;gap:12px;min-width:0}
    .sc-top-right{display:flex;align-items:center;gap:8px}
    .sc-brand{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700}
    .sc-brand-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a78bfa);box-shadow:0 0 10px rgba(99,102,241,.5)}
    .sc-status{display:flex;align-items:center;gap:6px;font-size:12px;color:#a1a1aa;background:rgba(255,255,255,.04);padding:5px 9px;border-radius:7px;border:1px solid rgba(255,255,255,.06)}
    .sc-status-live{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 8px rgba(16,185,129,.6);animation:scPulse 2s ease infinite}
    @keyframes scPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.85)}}
    .sc-timer{font-variant-numeric:tabular-nums;color:#f4f4f5;font-weight:500}
    .sc-top-btn{width:32px;height:32px;border-radius:9px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#a1a1aa;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
    .sc-top-btn:hover{background:rgba(255,255,255,.10);color:#fff}

    /* Stage */
    #sc-stage{flex:1;display:flex;min-height:0;padding:6px 14px 0;gap:12px;position:relative}
    #sc-call.minimized #sc-stage{padding:0}
    #sc-videos{flex:1;min-width:0;position:relative;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#13131a,#0e0e16);box-shadow:0 18px 48px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.04) inset}
    #sc-call.minimized #sc-videos{border-radius:0}
    #sc-remote-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    #sc-waiting{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#a1a1aa;z-index:2;background:radial-gradient(400px 300px at 50% 40%,rgba(99,102,241,.15),transparent 60%)}
    .sc-spinner{width:32px;height:32px;border:3px solid rgba(255,255,255,.08);border-top-color:#6366f1;border-radius:50%;animation:scSpin .9s linear infinite}
    @keyframes scSpin{to{transform:rotate(360deg)}}
    #sc-waiting p{font-size:14px;font-weight:500;color:#f4f4f5}
    #sc-waiting .sc-waiting-hint{font-size:12px;color:#71717a}

    /* Local PiP */
    #sc-local{position:absolute;top:14px;right:14px;width:140px;height:200px;border-radius:14px;overflow:hidden;border:2px solid rgba(255,255,255,.12);background:#13131a;z-index:5;touch-action:none;cursor:grab;box-shadow:0 12px 32px rgba(0,0,0,.5);transition:box-shadow .2s}
    #sc-local:active{cursor:grabbing;box-shadow:0 16px 40px rgba(0,0,0,.7)}
    #sc-local video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);pointer-events:none}
    #sc-local.no-video{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a24,#10101a)}
    #sc-local.no-video::after{content:'You';color:#71717a;font-size:11px;font-weight:500}
    #sc-call.minimized #sc-local{width:70px;height:50px;top:6px;right:6px;border-radius:8px}

    /* Chat */
    #sc-chat{width:320px;flex-shrink:0;display:none;flex-direction:column;background:rgba(15,15,22,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin-bottom:8px;overflow:hidden;animation:scSlide .25s cubic-bezier(.4,0,.2,1)}
    @keyframes scSlide{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
    #sc-chat.open{display:flex}
    .sc-chat-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.06)}
    .sc-chat-head h3{font-size:13px;font-weight:600}
    .sc-chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
    .sc-chat-msgs::-webkit-scrollbar{width:6px}
    .sc-chat-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
    .sc-chat-empty{margin:auto;text-align:center;color:#52525b}
    .sc-chat-empty p{font-size:13px;color:#a1a1aa;margin-bottom:4px}
    .sc-chat-empty span{font-size:11px}
    .sc-msg-row{display:flex;flex-direction:column;max-width:88%}
    .sc-msg-row-me{align-self:flex-end;align-items:flex-end}
    .sc-msg-from{font-size:10px;color:#52525b;margin-bottom:3px;padding:0 4px}
    .sc-msg-bubble{padding:8px 12px;font-size:13px;line-height:1.4;border-radius:14px;word-break:break-word;animation:scMsgIn .2s ease}
    @keyframes scMsgIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
    .sc-msg-theirs{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.04);color:#f4f4f5;border-bottom-left-radius:4px}
    .sc-msg-mine{background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;border-bottom-right-radius:4px;box-shadow:0 8px 22px rgba(99,102,241,.25)}
    .sc-msg-link{color:#fff;text-decoration:underline}
    .sc-chat-input{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.2)}
    .sc-chat-input input{flex:1;padding:9px 12px;border-radius:9px;border:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.3);color:#fff;font-size:13px;outline:none;font-family:inherit;transition:border .15s,box-shadow .15s}
    .sc-chat-input input:focus{border-color:rgba(99,102,241,.6);box-shadow:0 0 0 3px rgba(99,102,241,.12)}
    .sc-chat-input button{border:none;border-radius:9px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;padding:0 14px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:all .15s}
    .sc-chat-input button:hover:not(:disabled){transform:translateY(-1px)}
    .sc-chat-input button:disabled{opacity:.4;cursor:not-allowed}

    /* Controls */
    #sc-bar{display:flex;align-items:center;justify-content:center;padding:14px 18px 20px;background:linear-gradient(0deg,rgba(7,7,16,.95),rgba(7,7,16,0));flex-shrink:0;position:relative;z-index:6}
    #sc-call.minimized #sc-bar{display:none}
    .sc-bar-inner{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(20,20,28,.78);backdrop-filter:blur(28px) saturate(1.4);-webkit-backdrop-filter:blur(28px) saturate(1.4);border:1px solid rgba(255,255,255,.06);border-radius:22px;box-shadow:0 18px 48px rgba(0,0,0,.5)}
    .sc-ctrl-wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px}
    .sc-ctrl{width:46px;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.04);color:#f4f4f5;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s cubic-bezier(.4,0,.2,1);position:relative;font-family:inherit}
    .sc-ctrl:hover:not(:disabled){background:rgba(255,255,255,.10);transform:translateY(-1px)}
    .sc-ctrl:active{transform:translateY(0)}
    .sc-ctrl-accent{background:linear-gradient(135deg,rgba(99,102,241,.9),rgba(124,58,237,.9));border-color:transparent;box-shadow:0 8px 22px rgba(99,102,241,.35)}
    .sc-ctrl-danger{background:linear-gradient(135deg,#ef4444,#dc2626);border-color:transparent;color:#fff;box-shadow:0 8px 22px rgba(239,68,68,.3)}
    .sc-ctrl-hang{width:62px;background:linear-gradient(135deg,#ef4444,#b91c1c);border-color:transparent;color:#fff;box-shadow:0 10px 26px rgba(239,68,68,.45)}
    .sc-ctrl-hang:hover{transform:translateY(-1px) scale(1.02);box-shadow:0 14px 30px rgba(239,68,68,.55)}
    .sc-ctrl-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
    .sc-ctrl-label{font-size:10px;color:#71717a;font-weight:500;letter-spacing:.2px;display:none}
    .sc-ctrl[disabled]{opacity:.5;cursor:not-allowed}
    .sc-mini-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.18);border-top-color:#fff;border-radius:50%;animation:scSpin .8s linear infinite}

    /* More menu */
    .sc-more-pop{position:absolute;bottom:calc(100% + 12px);right:0;min-width:200px;background:rgba(22,22,30,.96);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:6px;box-shadow:0 24px 60px rgba(0,0,0,.6);z-index:20;display:none;animation:scPop .15s ease}
    @keyframes scPop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .sc-more-pop.open{display:block}
    .sc-more-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:transparent;color:#d4d4d8;font-size:13px;border-radius:8px;cursor:pointer;text-align:left;transition:background .12s;font-family:inherit}
    .sc-more-item:hover{background:rgba(255,255,255,.06);color:#fff}

    /* Minimize chrome */
    .sc-min-chrome{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);z-index:10;font-size:10px;font-weight:600;color:#f4f4f5;cursor:move}
    #sc-call.minimized .sc-min-chrome{display:flex !important}
    .sc-min-chrome:not(.shown){display:none}
    .sc-min-actions{display:flex;gap:4px}
    .sc-min-btn{width:24px;height:24px;border-radius:6px;border:none;background:rgba(255,255,255,.14);color:#f4f4f5;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .12s}
    .sc-min-btn:hover{background:rgba(255,255,255,.22)}
    .sc-min-btn-danger{background:rgba(239,68,68,.85)}

    /* Toast */
    #sc-toast{position:fixed;bottom:110px;left:50%;transform:translateX(-50%);padding:10px 16px;border-radius:11px;font-size:13px;font-weight:500;background:rgba(22,22,30,.96);border:1px solid rgba(255,255,255,.08);color:#f4f4f5;backdrop-filter:blur(16px);box-shadow:0 18px 48px rgba(0,0,0,.5);z-index:100002;display:none;animation:scToast .25s ease}
    @keyframes scToast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    #sc-toast.success{border-color:rgba(16,185,129,.4);color:#6ee7b7}
    #sc-toast.error{border-color:rgba(239,68,68,.4);color:#fca5a5}
    #sc-toast.warn{border-color:rgba(245,158,11,.4);color:#fcd34d}

    /* Responsive */
    @media(max-width:600px){
      #sc-stage{padding:4px 8px 0}
      #sc-bar{padding:10px 8px 14px}
      .sc-bar-inner{gap:6px;padding:8px 10px}
      .sc-ctrl{width:42px;height:42px}
      .sc-ctrl-hang{width:54px}
      #sc-chat{position:fixed;inset:0;width:100%;border-radius:0;margin:0;z-index:30}
      #sc-local{width:100px;height:140px;top:10px;right:10px}
      .sc-modal{padding:22px}
    }
    @media(max-width:380px){
      .sc-ctrl{width:38px;height:38px;border-radius:11px}
      .sc-ctrl-hang{width:48px}
      .sc-bar-inner{gap:4px;padding:7px 8px}
    }
  `;
  document.head.appendChild(style);

  // ── Build UI ─────────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'sc-btn';
  btn.innerHTML = `<span class="sc-btn-pulse"></span><span>${btnText}</span>`;
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'sc-overlay';
  overlay.innerHTML = `
    <div class="sc-modal">
      <div class="sc-modal-head">
        <div class="sc-modal-icon">${SVG.play}</div>
        <div>
          <div class="sc-modal-title">Talk to us live</div>
          <div class="sc-modal-subtitle">HD video call with our team</div>
        </div>
      </div>
      <div class="sc-input-wrap">
        <div class="sc-input-label">Your name</div>
        <input id="sc-name" placeholder="e.g. Priya Sharma" />
      </div>
      <div class="sc-input-wrap">
        <div class="sc-input-label">Phone (we'll call back if needed)</div>
        <input id="sc-phone" type="tel" placeholder="+91 98765 43210" />
      </div>
      <button class="sc-btn-primary" id="sc-join-btn"><span>Start video call</span></button>
      <button class="sc-btn-ghost" id="sc-cancel-btn">Cancel</button>
      <div class="sc-modal-error" id="sc-error"></div>
      <div class="sc-trust-row">
        <span>${SVG.shield}<span>Encrypted</span></span>
        <span>${SVG.signal}<span>HD video</span></span>
        <span>${SVG.sparkles}<span>Free preview</span></span>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const callEl = document.createElement('div');
  callEl.id = 'sc-call';
  callEl.innerHTML = `
    <div class="sc-min-chrome">
      <span>Live · <span id="sc-min-timer">0:00</span></span>
      <div class="sc-min-actions">
        <button class="sc-min-btn" id="sc-min-mic" title="Mic">${SVG.mic}</button>
        <button class="sc-min-btn" id="sc-min-cam" title="Camera">${SVG.cam}</button>
        <button class="sc-min-btn" id="sc-min-expand" title="Expand">${SVG.expand}</button>
        <button class="sc-min-btn sc-min-btn-danger" id="sc-min-end" title="End">${SVG.hang}</button>
      </div>
    </div>

    <header id="sc-top">
      <div class="sc-top-left">
        <div class="sc-brand"><span class="sc-brand-dot"></span><span>ShopCall</span></div>
        <div class="sc-status"><span class="sc-status-live"></span><span>Live · <span class="sc-timer" id="sc-timer">0:00</span></span></div>
      </div>
      <div class="sc-top-right">
        <button class="sc-top-btn" id="sc-top-min" title="Minimize">${SVG.minimize}</button>
      </div>
    </header>

    <div id="sc-stage">
      <div id="sc-videos">
        <div id="sc-waiting">
          <div class="sc-spinner"></div>
          <p>Waiting for our team to connect…</p>
          <span class="sc-waiting-hint">This usually takes under 30 seconds</span>
        </div>
        <div id="sc-local"></div>
      </div>
      <div id="sc-chat">
        <div class="sc-chat-head">
          <h3>Chat</h3>
          <button class="sc-top-btn" id="sc-chat-close">${SVG.close}</button>
        </div>
        <div class="sc-chat-msgs" id="sc-chat-msgs">
          <div class="sc-chat-empty"><p>No messages yet</p><span>The agent may share product links here</span></div>
        </div>
        <div class="sc-chat-input">
          <input id="sc-chat-text" placeholder="Type a message…" />
          <button id="sc-chat-send">${SVG.send}</button>
        </div>
      </div>
    </div>

    <footer id="sc-bar">
      <div class="sc-bar-inner">
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl" id="sc-mic" title="Mic">${SVG.mic}</button>
        </div>
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl" id="sc-cam" title="Camera">${SVG.cam}</button>
        </div>
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl" id="sc-flip" title="Flip camera">${SVG.flip}</button>
        </div>
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl" id="sc-blur" title="Blur background">${SVG.sparkles}</button>
        </div>
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl" id="sc-chat-btn" title="Chat">${SVG.chat}</button>
        </div>
        <div class="sc-ctrl-wrap" style="position:relative">
          <button class="sc-ctrl" id="sc-more" title="More">${SVG.more}</button>
          <div class="sc-more-pop" id="sc-more-pop">
            <button class="sc-more-item" id="sc-more-pip">${SVG.pip}<span>Picture-in-Picture</span></button>
            <button class="sc-more-item" id="sc-more-min">${SVG.minimize}<span>Minimize</span></button>
          </div>
        </div>
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl sc-ctrl-hang" id="sc-end" title="End call">${SVG.hang}</button>
        </div>
      </div>
    </footer>
  `;
  document.body.appendChild(callEl);

  const toast = document.createElement('div');
  toast.id = 'sc-toast';
  document.body.appendChild(toast);

  // ── Element shortcuts ────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const local = $('sc-local');
  const videos = $('sc-videos');
  const waiting = $('sc-waiting');
  const chat = $('sc-chat');
  const chatBtn = $('sc-chat-btn');
  const micBtn = $('sc-mic');
  const camBtn = $('sc-cam');
  const flipBtn = $('sc-flip');
  const blurBtn = $('sc-blur');
  const endBtn = $('sc-end');
  const moreBtn = $('sc-more');
  const morePop = $('sc-more-pop');
  const morePip = $('sc-more-pip');
  const moreMin = $('sc-more-min');
  const topMin = $('sc-top-min');
  const timerEl = $('sc-timer');
  const minTimerEl = $('sc-min-timer');
  const minMic = $('sc-min-mic');
  const minCam = $('sc-min-cam');
  const minExpand = $('sc-min-expand');
  const minEnd = $('sc-min-end');

  // ── State ────────────────────────────────────────────────────────────────
  let meeting = null;
  let currentCallId = null;
  let socket = null;
  let isJoining = false;
  let micOn = true;
  let camOn = true;
  let blurOn = false;
  let blurLoading = false;
  let blurTrack = null;
  let cameras = [];
  let activeCamId = null;
  let unread = 0;
  let timerSecs = 0;
  let timerInt = null;
  let pipVideo = null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  async function applyCustomTrack(track) {
    if (!meeting) throw new Error('No meeting');
    // Try the various changeWebcam signatures that VideoSDK has used across versions
    try { return await meeting.changeWebcam({ customTrack: track }); } catch (e) {}
    try { return await meeting.changeWebcam(track); } catch (e) {}
    try {
      meeting.disableWebcam();
      await new Promise(r => setTimeout(r, 250));
      return meeting.enableWebcam(track);
    } catch (e) { throw e; }
  }
  async function applyDeviceId(deviceId) {
    if (!meeting) throw new Error('No meeting');
    try { return await meeting.changeWebcam(deviceId); } catch (e) {}
    try { return await meeting.changeWebcam({ deviceId }); } catch (e) { throw e; }
  }

  function showToast(msg, type = 'info', ms = 2500) {
    toast.textContent = msg;
    toast.className = type;
    toast.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.style.display = 'none'; }, ms);
  }

  function formatTime(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}` : `${m}:${String(x).padStart(2,'0')}`;
  }

  function startTimer() {
    timerSecs = 0;
    timerInt = setInterval(() => {
      timerSecs++;
      const t = formatTime(timerSecs);
      if (timerEl) timerEl.textContent = t;
      if (minTimerEl) minTimerEl.textContent = t;
    }, 1000);
  }
  function stopTimer() { if (timerInt) { clearInterval(timerInt); timerInt = null; } }

  function setCtrlIcon(el, name, kind) {
    el.innerHTML = SVG[name];
    el.classList.remove('sc-ctrl-accent', 'sc-ctrl-danger');
    if (kind === 'accent') el.classList.add('sc-ctrl-accent');
    if (kind === 'danger') el.classList.add('sc-ctrl-danger');
  }

  function updateMicUI() {
    setCtrlIcon(micBtn, micOn ? 'mic' : 'micOff', micOn ? null : 'danger');
    minMic.innerHTML = SVG[micOn ? 'mic' : 'micOff'].replace('width="20"', 'width="13"').replace('height="20"', 'height="13"');
  }
  function updateCamUI() {
    setCtrlIcon(camBtn, camOn ? 'cam' : 'camOff', camOn ? null : 'danger');
    minCam.innerHTML = SVG[camOn ? 'cam' : 'camOff'].replace('width="20"', 'width="13"').replace('height="20"', 'height="13"');
    local.classList.toggle('no-video', !camOn);
  }
  function updateBlurUI() {
    setCtrlIcon(blurBtn, 'sparkles', blurOn ? 'accent' : null);
  }
  function updateChatBadge() {
    let badge = chatBtn.querySelector('.sc-ctrl-badge');
    if (unread > 0) {
      if (!badge) { badge = document.createElement('span'); badge.className = 'sc-ctrl-badge'; chatBtn.appendChild(badge); }
      badge.textContent = unread;
    } else if (badge) badge.remove();
  }

  function linkify(text) {
    return text.replace(/(\bhttps?:\/\/\S+)/g, (m) => `<a href="${m}" target="_blank" rel="noopener" class="sc-msg-link">${m}</a>`);
  }

  function addChatMsg(name, text, isMe) {
    const empty = chat.querySelector('.sc-chat-empty');
    if (empty) empty.remove();
    const row = document.createElement('div');
    row.className = `sc-msg-row${isMe ? ' sc-msg-row-me' : ''}`;
    row.innerHTML = `${isMe ? '' : `<span class="sc-msg-from">${name}</span>`}<div class="sc-msg-bubble ${isMe ? 'sc-msg-mine' : 'sc-msg-theirs'}">${linkify(text)}</div>`;
    $('sc-chat-msgs').appendChild(row);
    $('sc-chat-msgs').scrollTop = $('sc-chat-msgs').scrollHeight;
  }

  // ── Pre-call modal handlers ──────────────────────────────────────────────
  btn.onclick = () => overlay.classList.add('active');
  $('sc-cancel-btn').onclick = () => overlay.classList.remove('active');
  overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('active'); };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (callEl.classList.contains('active')) endCall();
      else overlay.classList.remove('active');
    }
  });

  $('sc-join-btn').onclick = startJoinFlow;

  async function startJoinFlow() {
    if (isJoining) return;
    isJoining = true;
    const joinBtn = $('sc-join-btn');
    joinBtn.disabled = true;
    joinBtn.innerHTML = '<div class="sc-mini-spin"></div><span>Connecting…</span>';
    const name = $('sc-name').value || 'Shopper';
    const phone = $('sc-phone').value || '';
    const errEl = $('sc-error');
    errEl.classList.remove('active');

    try {
      const res = await fetch(`${API_BASE}/video/join-meeting`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdkKey: storeKey, shopperName: name, shopperPhone: phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'limit_reached') {
          showCallbackModal(name, phone);
        } else {
          errEl.textContent = data.message || data.error;
          errEl.classList.add('active');
        }
        joinBtn.disabled = false;
        joinBtn.innerHTML = '<span>Start video call</span>';
        isJoining = false;
        return;
      }

      currentCallId = data.callId;
      overlay.classList.remove('active');
      callEl.classList.add('active');

      // Wait for VideoSDK + Socket.IO scripts
      await Promise.all([loadScript(SOCKETIO_SRC), loadScript(VIDEOSDK_SRC)]);

      const SOCKET_URL = API_BASE.replace('/api', '');
      socket = window.io(SOCKET_URL);
      socket.emit('join-room', currentCallId);
      socket.emit('join-room', `call:${currentCallId}`);

      socket.on('chat-message', (msg) => {
        addChatMsg(msg.sender, msg.message, false);
        if (!chat.classList.contains('open')) { unread++; updateChatBadge(); }
      });
      socket.on('call-rejected', () => { showToast('Call ended', 'warn'); endCall(); });
      socket.on('call-accepted', async (roomData) => initVideoSDK(roomData, name));

    } catch (err) {
      errEl.textContent = 'Connection failed. Please try again.';
      errEl.classList.add('active');
      joinBtn.disabled = false;
      joinBtn.innerHTML = '<span>Start video call</span>';
      isJoining = false;
    }
  }

  function showCallbackModal(name, phone) {
    const modal = overlay.querySelector('.sc-modal');
    modal.innerHTML = `
      <div class="sc-modal-head">
        <div class="sc-modal-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">${SVG.signal.replace('width="12"','width="18"').replace('height="12"','height="18"')}</div>
        <div>
          <div class="sc-modal-title">We'll call you back</div>
          <div class="sc-modal-subtitle">Our team is busy — leave your number</div>
        </div>
      </div>
      <div class="sc-input-wrap">
        <div class="sc-input-label">Phone number</div>
        <input id="sc-cb-phone" type="tel" value="${phone}" placeholder="+91 98765 43210"/>
      </div>
      <button class="sc-btn-primary" id="sc-cb-submit"><span>Request callback</span></button>
      <button class="sc-btn-ghost" id="sc-cb-cancel">Cancel</button>
      <div class="sc-modal-error" id="sc-cb-msg"></div>
    `;
    $('sc-cb-cancel').onclick = () => { overlay.classList.remove('active'); };
    $('sc-cb-submit').onclick = () => {
      const ph = $('sc-cb-phone').value;
      const m = $('sc-cb-msg');
      if (!ph) { m.textContent = 'Please enter a phone number'; m.classList.add('active'); return; }
      m.textContent = '✓ Got it — we will reach out soon';
      m.style.background = 'rgba(16,185,129,.1)';
      m.style.borderColor = 'rgba(16,185,129,.3)';
      m.style.color = '#6ee7b7';
      m.classList.add('active');
      $('sc-cb-submit').disabled = true;
      $('sc-cb-submit').innerHTML = '<span>Submitted</span>';
      fetch(`${API_BASE}/video/join-meeting`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdkKey: storeKey, shopperName: name, shopperPhone: ph, callbackOnly: true }),
      }).catch(() => {});
    };
  }

  // ── VideoSDK lifecycle ───────────────────────────────────────────────────
  async function initVideoSDK(roomData, name) {
    waiting.querySelector('p').textContent = 'Connecting video…';

    window.VideoSDK.config(roomData.token);
    meeting = window.VideoSDK.initMeeting({
      meetingId: roomData.meetingId,
      name,
      micEnabled: true,
      webcamEnabled: true,
    });

    meeting.on('meeting-joined', async () => {
      startTimer();
      waiting.style.display = 'none';
      try {
        const r = meeting.getWebcams ? meeting.getWebcams() : [];
        cameras = Array.isArray(r) ? r : (await r) || [];
      } catch (e) { cameras = []; }
      if (cameras.length > 0) activeCamId = cameras[0].deviceId;
      bindLocalStreams();
    });

    meeting.on('participant-joined', (p) => {
      p.on('stream-enabled', (stream) => {
        if (stream.kind === 'video') {
          let v = $('sc-remote-video');
          if (!v) {
            v = document.createElement('video');
            v.id = 'sc-remote-video';
            v.autoplay = true;
            v.playsInline = true;
            videos.insertBefore(v, videos.firstChild);
          }
          v.srcObject = new MediaStream([stream.track]);
          pipVideo = v;
        }
        if (stream.kind === 'audio') {
          let a = $('sc-remote-audio');
          if (!a) {
            a = document.createElement('audio');
            a.id = 'sc-remote-audio';
            a.autoplay = true;
            document.body.appendChild(a);
          }
          a.srcObject = new MediaStream([stream.track]);
        }
      });
    });

    meeting.on('participant-left', () => endCall());
    meeting.join();
  }

  function bindLocalStreams() {
    meeting.localParticipant.on('stream-enabled', (stream) => {
      if (stream.kind === 'video') {
        let v = local.querySelector('video');
        if (!v) {
          v = document.createElement('video');
          v.autoplay = true;
          v.playsInline = true;
          v.muted = true;
          local.appendChild(v);
        }
        v.srcObject = new MediaStream([stream.track]);
        local.classList.remove('no-video');
      }
    });
    meeting.localParticipant.on('stream-disabled', (stream) => {
      if (stream.kind === 'video') {
        const v = local.querySelector('video');
        if (v) v.srcObject = null;
        local.classList.add('no-video');
      }
    });
  }

  // ── Controls ─────────────────────────────────────────────────────────────
  micBtn.onclick = () => {
    if (!meeting) return;
    micOn ? meeting.muteMic() : meeting.unmuteMic();
    micOn = !micOn;
    updateMicUI();
  };
  minMic.onclick = (e) => { e.stopPropagation(); micBtn.click(); };

  camBtn.onclick = () => {
    if (!meeting) return;
    if (camOn) {
      if (blurOn) { blurTrack?._teardown?.(); blurTrack = null; blurOn = false; updateBlurUI(); }
      meeting.disableWebcam();
    } else {
      meeting.enableWebcam();
    }
    camOn = !camOn;
    updateCamUI();
  };
  minCam.onclick = (e) => { e.stopPropagation(); camBtn.click(); };

  flipBtn.onclick = async () => {
    if (!meeting) return;
    try {
      const r = meeting.getWebcams ? meeting.getWebcams() : [];
      cameras = Array.isArray(r) ? r : (await r) || [];
    } catch (e) {}
    if (cameras.length < 2) { showToast('Only one camera detected', 'warn'); return; }
    const current = activeCamId;
    const next = cameras.find(c => c.deviceId !== current) || cameras[0];
    if (!next) return;
    try {
      if (blurOn) {
        const old = blurTrack;
        const track = await createBlurredTrack({ deviceId: next.deviceId });
        blurTrack = track;
        await applyCustomTrack(track);
        old?._teardown?.();
      } else {
        await applyDeviceId(next.deviceId);
      }
      activeCamId = next.deviceId;
      showToast('Camera switched', 'success');
    } catch (e) { showToast('Switch failed', 'error'); }
  };

  blurBtn.onclick = async () => {
    if (blurLoading || !meeting) return;
    if (blurOn) {
      blurTrack?._teardown?.();
      blurTrack = null;
      try { if (activeCamId) await applyDeviceId(activeCamId); } catch (e) {}
      blurOn = false;
      updateBlurUI();
      showToast('Background blur off', 'info');
      return;
    }
    blurLoading = true;
    blurBtn.innerHTML = '<div class="sc-mini-spin"></div>';
    blurBtn.disabled = true;
    try {
      if (!camOn) { meeting.enableWebcam(); camOn = true; updateCamUI(); }
      const track = await createBlurredTrack({ deviceId: activeCamId });
      blurTrack = track;
      await applyCustomTrack(track);
      blurOn = true;
      showToast('Background blur on', 'success');
    } catch (e) { console.error('[ShopCall] Blur error:', e); showToast('Blur unavailable — try again', 'error'); }
    finally {
      blurLoading = false;
      blurBtn.disabled = false;
      updateBlurUI();
    }
  };

  chatBtn.onclick = () => {
    chat.classList.toggle('open');
    if (chat.classList.contains('open')) { unread = 0; updateChatBadge(); }
  };
  $('sc-chat-close').onclick = () => chat.classList.remove('open');
  $('sc-chat-send').onclick = sendChat;
  $('sc-chat-text').onkeydown = (e) => { if (e.key === 'Enter') sendChat(); };

  function sendChat() {
    const input = $('sc-chat-text');
    const msg = input.value.trim();
    if (!msg || !socket || !currentCallId) return;
    const name = $('sc-name').value || 'Shopper';
    socket.emit('chat-message', { callId: currentCallId, sender: name, senderRole: 'shopper', message: msg });
    addChatMsg('You', msg, true);
    input.value = '';
  }

  moreBtn.onclick = (e) => { e.stopPropagation(); morePop.classList.toggle('open'); };
  document.addEventListener('click', (e) => {
    if (!moreBtn.contains(e.target) && !morePop.contains(e.target)) morePop.classList.remove('open');
  });

  morePip.onclick = () => { togglePiP(); morePop.classList.remove('open'); };
  moreMin.onclick = () => { minimize(); morePop.classList.remove('open'); };
  topMin.onclick = minimize;
  minExpand.onclick = (e) => { e.stopPropagation(); expand(); };
  minEnd.onclick = (e) => { e.stopPropagation(); endCall(); };
  endBtn.onclick = endCall;

  // ── PiP ──────────────────────────────────────────────────────────────────
  async function togglePiP() {
    if (!pipVideo) { showToast('Video not ready', 'warn'); return; }
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await pipVideo.requestPictureInPicture();
    } catch (e) { showToast('Picture-in-Picture unavailable', 'error'); }
  }

  document.addEventListener('visibilitychange', async () => {
    if (!pipVideo || !pipVideo.srcObject || !callEl.classList.contains('active')) return;
    if (document.hidden) {
      if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        try { await pipVideo.requestPictureInPicture(); } catch (e) {}
      }
    } else if (document.pictureInPictureElement === pipVideo) {
      try { await document.exitPictureInPicture(); } catch (e) {}
    }
  });

  // ── Minimize ─────────────────────────────────────────────────────────────
  let minPos = null;
  function minimize() {
    if (callEl.classList.contains('minimized')) return;
    callEl.classList.add('minimized');
    if (!minPos) minPos = { x: window.innerWidth - 320, y: window.innerHeight - 220 };
    callEl.style.left = minPos.x + 'px';
    callEl.style.top = minPos.y + 'px';
  }
  function expand() {
    callEl.classList.remove('minimized');
    callEl.style.left = '';
    callEl.style.top = '';
  }

  // Drag for minimized
  (function() {
    let drag = false, ox = 0, oy = 0, sx = 0, sy = 0;
    callEl.addEventListener('pointerdown', (e) => {
      if (!callEl.classList.contains('minimized')) return;
      if (e.target.closest('.sc-min-btn')) return;
      drag = true;
      ox = minPos?.x || 0; oy = minPos?.y || 0;
      sx = e.clientX; sy = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const W = window.innerWidth, H = window.innerHeight;
      const nx = Math.max(8, Math.min(W - 310, ox + (e.clientX - sx)));
      const ny = Math.max(8, Math.min(H - 210, oy + (e.clientY - sy)));
      minPos = { x: nx, y: ny };
      callEl.style.left = nx + 'px';
      callEl.style.top = ny + 'px';
    });
    window.addEventListener('pointerup', () => { drag = false; });
  })();

  // ── Local PiP draggable inside call ──────────────────────────────────────
  (function() {
    let drag = false, sx = 0, sy = 0, ox = 0, oy = 0;
    local.addEventListener('pointerdown', (e) => {
      if (callEl.classList.contains('minimized')) return;
      drag = true;
      const r = local.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY;
      ox = r.left; oy = r.top;
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      e.preventDefault();
      const parent = videos.getBoundingClientRect();
      const nx = Math.max(0, Math.min(parent.width - local.offsetWidth, ox - parent.left + (e.clientX - sx)));
      const ny = Math.max(0, Math.min(parent.height - local.offsetHeight, oy - parent.top + (e.clientY - sy)));
      local.style.left = nx + 'px';
      local.style.top = ny + 'px';
      local.style.right = 'auto'; local.style.bottom = 'auto';
    }, { passive: false });
    window.addEventListener('pointerup', () => { drag = false; });
  })();

  // ── End call ─────────────────────────────────────────────────────────────
  function endCall() {
    stopTimer();
    if (meeting) { try { meeting.leave(); } catch (e) {} meeting = null; }
    if (blurTrack) { blurTrack._teardown?.(); blurTrack = null; }
    if (socket) { socket.disconnect(); socket = null; }
    if (currentCallId) {
      fetch(`${API_BASE}/video/end-call`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: currentCallId }),
      }).catch(() => {});
      currentCallId = null;
    }
    expand();
    callEl.classList.remove('active');
    // Reset UI
    isJoining = false;
    micOn = true; camOn = true; blurOn = false; unread = 0; pipVideo = null;
    updateMicUI(); updateCamUI(); updateBlurUI(); updateChatBadge();
    $('sc-chat-text').value = '';
    $('sc-chat-msgs').innerHTML = '<div class="sc-chat-empty"><p>No messages yet</p><span>The agent may share product links here</span></div>';
    chat.classList.remove('open');
    waiting.style.display = 'flex';
    waiting.querySelector('p').textContent = 'Waiting for our team to connect…';
    const v = $('sc-remote-video'); if (v) v.remove();
    const a = $('sc-remote-audio'); if (a) a.remove();
    local.innerHTML = '';
    // Reset modal
    overlay.querySelector('.sc-modal').innerHTML = `
      <div class="sc-modal-head">
        <div class="sc-modal-icon">${SVG.play}</div>
        <div>
          <div class="sc-modal-title">Talk to us live</div>
          <div class="sc-modal-subtitle">HD video call with our team</div>
        </div>
      </div>
      <div class="sc-input-wrap">
        <div class="sc-input-label">Your name</div>
        <input id="sc-name" placeholder="e.g. Priya Sharma" />
      </div>
      <div class="sc-input-wrap">
        <div class="sc-input-label">Phone (we'll call back if needed)</div>
        <input id="sc-phone" type="tel" placeholder="+91 98765 43210" />
      </div>
      <button class="sc-btn-primary" id="sc-join-btn"><span>Start video call</span></button>
      <button class="sc-btn-ghost" id="sc-cancel-btn">Cancel</button>
      <div class="sc-modal-error" id="sc-error"></div>
      <div class="sc-trust-row">
        <span>${SVG.shield}<span>Encrypted</span></span>
        <span>${SVG.signal}<span>HD video</span></span>
        <span>${SVG.sparkles}<span>Free preview</span></span>
      </div>`;
    $('sc-join-btn').onclick = startJoinFlow;
    $('sc-cancel-btn').onclick = () => overlay.classList.remove('active');
  }

  window.addEventListener('beforeunload', () => {
    if (meeting) { try { meeting.leave(); } catch (e) {} }
    if (currentCallId) navigator.sendBeacon(`${API_BASE}/video/end-call`, JSON.stringify({ callId: currentCallId }));
  });

  // ── Background blur (MediaPipe Selfie Segmentation) ──────────────────────
  async function createBlurredTrack({ deviceId, intensity = 12 } = {}) {
    await loadMediaPipe();
    const constraints = {
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      audio: false,
    };
    if (deviceId) constraints.video.deviceId = { exact: deviceId };
    const rawStream = await navigator.mediaDevices.getUserMedia(constraints);
    const settings = rawStream.getVideoTracks()[0].getSettings();
    const W = settings.width || 1280, H = settings.height || 720;

    const video = document.createElement('video');
    video.srcObject = rawStream; video.muted = true; video.playsInline = true;
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

    const out = canvas.captureStream(30);
    const outTrack = out.getVideoTracks()[0];
    outTrack._teardown = () => {
      active = false;
      rawStream.getTracks().forEach(t => t.stop());
      try { seg.close(); } catch (e) {}
    };
    return outTrack;
  }

  // Initial UI sync
  updateMicUI(); updateCamUI(); updateBlurUI();
  console.log('[ShopCall] Ready');
})();
