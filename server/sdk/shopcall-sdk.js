// (function() {
//   console.log('[ShopCall SDK] Loading...');
//   const script = document.currentScript;
//   if (!script) return console.error('[ShopCall SDK] ERROR: document.currentScript is null - script may be loaded async/deferred');
//   const storeKey = script.getAttribute('data-store');
//   const API_BASE = script.src.replace('/sdk/shopcall-sdk.js', '/api');
//   console.log('[ShopCall SDK] storeKey:', storeKey, 'API:', API_BASE);
//   if (!storeKey) return console.error('[ShopCall SDK] ERROR: data-store attribute missing');

//   const btnText = script.getAttribute('data-text') || '📹 Live Shop';
//   const btnBg = script.getAttribute('data-bg') || '#6366f1';
//   const btnColor = script.getAttribute('data-color') || '#ffffff';
//   const btnRadius = script.getAttribute('data-radius') || '50';
//   const btnPosition = script.getAttribute('data-position') || 'bottom-right';
//   const btnSize = script.getAttribute('data-size') || '14';
//   const posMap = { 'bottom-right': 'bottom:24px;right:24px', 'bottom-left': 'bottom:24px;left:24px', 'top-right': 'top:24px;right:24px', 'top-left': 'top:24px;left:24px' };
//   const posStyle = posMap[btnPosition] || posMap['bottom-right'];

//   // Load Socket.IO client
//   const ioScript = document.createElement('script');
//   ioScript.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
//   document.head.appendChild(ioScript);

//   // Load VideoSDK
//   const sdkScript = document.createElement('script');
//   sdkScript.src = 'https://sdk.videosdk.live/js-sdk/0.0.86/videosdk.js';
//   document.head.appendChild(sdkScript);

//   let socket = null;

//   const style = document.createElement('style');
//   style.textContent = `
//     #sc-btn{position:fixed;${posStyle};z-index:99999;background:${btnBg};color:${btnColor};border:none;padding:14px 24px;border-radius:${btnRadius}px;font-family:-apple-system,sans-serif;font-size:${btnSize}px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .2s}
//     #sc-btn:hover{transform:scale(1.05)}
//     #sc-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif}
//     #sc-overlay.active{display:flex}
//     #sc-modal-box{background:#111;border-radius:16px;padding:28px;width:90%;max-width:380px;color:#fff}
//     #sc-modal-box h3{font-size:17px;font-weight:600;margin-bottom:4px}
//     #sc-modal-box p.sub{font-size:13px;color:#71717a;margin-bottom:20px}
//     #sc-modal-box input{width:100%;padding:12px 14px;border-radius:8px;border:1px solid #27272a;background:#09090b;color:#fff;font-size:14px;box-sizing:border-box;outline:none;transition:border .2s}
//     #sc-modal-box input:focus{border-color:#6366f1}
//     .sc-btn-primary{background:#6366f1;color:#fff;width:100%;padding:12px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;transition:all .2s}
//     .sc-btn-primary:hover{background:#4f46e5}
//     .sc-btn-primary:disabled{opacity:.5;cursor:not-allowed}
//     .sc-btn-ghost{background:transparent;color:#71717a;width:100%;padding:10px;border:none;font-size:13px;cursor:pointer;margin-top:4px}
//     #sc-call{position:fixed;inset:0;z-index:100001;background:#09090b;display:none;flex-direction:column;font-family:-apple-system,sans-serif}
//     #sc-call.active{display:flex}
//     #sc-call-videos{flex:1;position:relative;overflow:hidden}
//     #sc-call-videos video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
//     #sc-local-pip{position:absolute;top:12px;right:12px;width:100px;height:140px;border-radius:12px;overflow:hidden;border:2px solid #27272a;z-index:5;background:#18181b;touch-action:none;cursor:grab;transition:box-shadow .2s}
//     #sc-local-pip:active{cursor:grabbing;box-shadow:0 4px 20px rgba(0,0,0,.5)}
//     #sc-local-pip video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);pointer-events:none}
//     #sc-call-waiting{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#71717a;z-index:2}
//     #sc-call-waiting .dot-pulse{width:8px;height:8px;border-radius:50%;background:#6366f1;animation:scPulse 1.2s infinite}
//     @keyframes scPulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
//     #sc-call-bar{padding:12px 16px;display:flex;align-items:center;justify-content:center;gap:10px;background:#0c0c0e;border-top:1px solid #1f1f23;flex-shrink:0}
//     .sc-ctrl{width:44px;height:44px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:all .15s}
//     .sc-ctrl:active{transform:scale(.9)}
//     .sc-ctrl-on{background:#1f1f23;color:#fff}
//     .sc-ctrl-off{background:#ef4444;color:#fff}
//     .sc-ctrl-end{width:52px;border-radius:22px;background:#ef4444;color:#fff}
//     .sc-ctrl-chat{background:#1f1f23;color:#fff;position:relative}
//     .sc-ctrl-chat.open{background:#6366f1}
//     .sc-ctrl-chat .badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 4px}
//     @keyframes scBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
//     .sc-ctrl-chat.notify{animation:scBounce .4s ease 2}
//     #sc-chat{position:absolute;bottom:0;right:0;top:0;width:280px;background:#0f0f11;border-left:1px solid #1f1f23;display:none;flex-direction:column;z-index:10}
//     #sc-chat.open{display:flex}
//     #sc-chat-head{padding:10px 14px;border-bottom:1px solid #1f1f23;display:flex;align-items:center;justify-content:space-between}
//     #sc-chat-head h4{font-size:13px;font-weight:600;color:#f4f4f5}
//     #sc-chat-msgs{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:6px}
//     .sc-msg{max-width:85%;padding:8px 12px;border-radius:10px;font-size:12px;color:#f4f4f5;word-break:break-word}
//     .sc-msg-me{align-self:flex-end;background:#6366f1;border-bottom-right-radius:2px}
//     .sc-msg-them{align-self:flex-start;background:#1f1f23;border-bottom-left-radius:2px}
//     .sc-msg-name{font-size:10px;color:#52525b;margin-bottom:2px}
//     #sc-chat-input{display:flex;gap:6px;padding:10px;border-top:1px solid #1f1f23}
//     #sc-chat-input input{flex:1;padding:8px 10px;border-radius:6px;border:1px solid #1f1f23;background:#09090b;color:#fff;font-size:12px;outline:none}
//     #sc-chat-input button{background:#6366f1;border:none;border-radius:6px;color:#fff;padding:8px 12px;font-size:11px;font-weight:600;cursor:pointer}
//     @media(max-width:500px){#sc-chat{width:100%;left:0}#sc-local-pip{width:80px;height:110px;top:8px;right:8px}}
//   `;
//   document.head.appendChild(style);

//   // Button
//   const btn = document.createElement('button');
//   btn.id = 'sc-btn';
//   btn.textContent = btnText;
//   document.body.appendChild(btn);
//   console.log('[ShopCall SDK] Button created:', btn.id, 'text:', btnText);

//   // Modal
//   const overlay = document.createElement('div');
//   overlay.id = 'sc-overlay';
//   overlay.innerHTML = `<div id="sc-modal-box">
//     <h3>Talk to us live</h3>
//     <p class="sub">Connect with our team via video call</p>
//     <input id="sc-name" placeholder="Your name" />
//     <input id="sc-phone" placeholder="Phone number (optional)" type="tel" style="margin-bottom:4px" />
//     <p style="font-size:10px;color:#52525b;margin-bottom:12px">If disconnected, we'll call you back</p>
//     <button class="sc-btn-primary" id="sc-join-btn">Start Video Call</button>
//     <button class="sc-btn-ghost" id="sc-cancel-btn">Cancel</button>
//     <p id="sc-error" style="color:#ef4444;font-size:12px;margin-top:8px;display:none"></p>
//   </div>`;
//   document.body.appendChild(overlay);

//   // Call screen
//   const callEl = document.createElement('div');
//   callEl.id = 'sc-call';
//   callEl.innerHTML = `
//     <div id="sc-call-videos">
//       <div id="sc-call-waiting"><div class="dot-pulse"></div><p>Waiting for agent...</p></div>
//       <div id="sc-local-pip"></div>
//       <div id="sc-chat">
//         <div id="sc-chat-head"><h4>Chat</h4><button id="sc-chat-close" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:14px">✕</button></div>
//         <div id="sc-chat-msgs"></div>
//         <div id="sc-chat-input"><input id="sc-chat-text" placeholder="Type a message..."/><button id="sc-chat-send">Send</button></div>
//       </div>
//     </div>
//     <div id="sc-call-bar">
//       <button class="sc-ctrl sc-ctrl-on" id="sc-mic">🎤</button>
//       <button class="sc-ctrl sc-ctrl-on" id="sc-cam">📷</button>
//       <button class="sc-ctrl sc-ctrl-chat" id="sc-chat-btn">💬</button>
//       <button class="sc-ctrl sc-ctrl-end" id="sc-end">📞</button>
//     </div>`;
//   document.body.appendChild(callEl);

//   let meeting = null, currentCallId = null, isJoining = false, micOn = true, camOn = true, unreadCount = 0;

//   btn.onclick = () => overlay.classList.add('active');
//   const closeModal = () => overlay.classList.remove('active');
//   document.getElementById('sc-cancel-btn').onclick = closeModal;
//   overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
//   document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (callEl.classList.contains('active')) endCall(); else closeModal(); } });

//   document.getElementById('sc-join-btn').onclick = async () => {
//     if (isJoining) return;
//     isJoining = true;
//     const joinBtn = document.getElementById('sc-join-btn');
//     joinBtn.disabled = true;
//     joinBtn.textContent = 'Connecting...';
//     const name = document.getElementById('sc-name').value || 'Shopper';
//     const phone = document.getElementById('sc-phone').value || '';
//     const errEl = document.getElementById('sc-error');
//     errEl.style.display = 'none';

//     try {
//       const res = await fetch(`${API_BASE}/video/join-meeting`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sdkKey: storeKey, shopperName: name, shopperPhone: phone }) });
//       const data = await res.json();
//       if (!res.ok) {
//         if (data.error === 'limit_reached') {
//           // Show friendly unavailable message
//           const box = document.getElementById('sc-modal-box');
//           box.innerHTML = `
//             <h3>We'll call you back!</h3>
//             <p class="sub">Our team is currently unavailable. Leave your number and we'll connect shortly.</p>
//             <input id="sc-callback-phone" placeholder="Your phone number" type="tel" value="${phone}" />
//             <button class="sc-btn-primary" id="sc-callback-btn">Request Callback</button>
//             <button class="sc-btn-ghost" id="sc-callback-cancel">Cancel</button>
//             <p id="sc-callback-msg" style="font-size:12px;margin-top:8px;display:none"></p>
//           `;
//           document.getElementById('sc-callback-cancel').onclick = () => { closeModal(); setTimeout(() => location.reload(), 100); };
//           document.getElementById('sc-callback-btn').onclick = () => {
//             const ph = document.getElementById('sc-callback-phone').value;
//             if (!ph) { const m = document.getElementById('sc-callback-msg'); m.textContent = 'Please enter your phone number'; m.style.color = '#ef4444'; m.style.display = 'block'; return; }
//             const m = document.getElementById('sc-callback-msg');
//             m.textContent = '✓ We will connect with you soon!';
//             m.style.color = '#22c55e';
//             m.style.display = 'block';
//             document.getElementById('sc-callback-btn').disabled = true;
//             document.getElementById('sc-callback-btn').textContent = 'Submitted';
//             // Send phone to API for store owner to see
//             fetch(`${API_BASE}/video/join-meeting`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sdkKey: storeKey, shopperName: name, shopperPhone: ph, callbackOnly: true }) }).catch(() => {});
//           };
//         } else {
//           errEl.textContent = data.message || data.error;
//           errEl.style.display = 'block';
//         }
//         joinBtn.disabled = false; joinBtn.textContent = 'Start Video Call'; isJoining = false; return;
//       }

//       currentCallId = data.callId;
//       closeModal();
//       callEl.classList.add('active');
//       document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Waiting for agent to accept...';

//       // Connect socket — wait for agent to accept
//       const SOCKET_URL = API_BASE.replace('/api', '');
//       socket = window.io(SOCKET_URL);
//       socket.emit('join-room', data.callId);
//       socket.emit('join-room', `call:${data.callId}`);
//       socket.on('chat-message', (msg) => {
//         addChatMsg(msg.sender, msg.message, false);
//         const chatPanel = document.getElementById('sc-chat');
//         if (!chatPanel.classList.contains('open')) { unreadCount++; updateChatBadge(); }
//       });

//       // Wait for agent to accept — THEN join VideoSDK (saves billing)
//       socket.on('call-accepted', async (roomData) => {
//         document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Connecting video...';

//         if (!window.VideoSDK) {
//           await new Promise((resolve, reject) => {
//             const check = setInterval(() => { if (window.VideoSDK) { clearInterval(check); resolve(); } }, 100);
//             setTimeout(() => { clearInterval(check); reject(new Error('timeout')); }, 10000);
//           });
//         }

//         window.VideoSDK.config(roomData.token);
//         meeting = window.VideoSDK.initMeeting({ meetingId: roomData.meetingId, name, micEnabled: true, webcamEnabled: true });

//         meeting.on('meeting-joined', () => {
//           document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Connected!';
//           setTimeout(() => { document.getElementById('sc-call-waiting').style.display = 'none'; }, 500);
//           meeting.localParticipant.on('stream-enabled', (stream) => {
//             if (stream.kind === 'video') {
//               const pip = document.getElementById('sc-local-pip');
//               let v = pip.querySelector('video');
//               if (!v) { v = document.createElement('video'); v.autoplay = true; v.playsInline = true; v.muted = true; pip.appendChild(v); }
//               v.srcObject = new MediaStream([stream.track]);
//             }
//           });
//           meeting.localParticipant.on('stream-disabled', (stream) => {
//             if (stream.kind === 'video') { const v = document.getElementById('sc-local-pip')?.querySelector('video'); if (v) v.srcObject = null; }
//           });
//         });

//         meeting.on('participant-joined', (p) => {
//           p.on('stream-enabled', (stream) => {
//             if (stream.kind === 'video') {
//               const vids = document.getElementById('sc-call-videos');
//               let v = vids.querySelector('#sc-remote-video');
//               if (!v) { v = document.createElement('video'); v.id = 'sc-remote-video'; v.autoplay = true; v.playsInline = true; vids.insertBefore(v, vids.firstChild); }
//               v.srcObject = new MediaStream([stream.track]);
//             }
//             if (stream.kind === 'audio') {
//               let a = document.getElementById('sc-remote-audio');
//               if (!a) { a = document.createElement('audio'); a.id = 'sc-remote-audio'; a.autoplay = true; document.body.appendChild(a); }
//               a.srcObject = new MediaStream([stream.track]);
//             }
//           });
//         });

//         meeting.on('participant-left', () => endCall());
//         meeting.join();
//       });

//       // If call gets rejected/cancelled by agent
//       socket.on('call-rejected', () => { endCall(); });

//     } catch (err) {
//       errEl.textContent = 'Connection failed. Try again.';
//       errEl.style.display = 'block';
//       callEl.classList.remove('active');
//       joinBtn.disabled = false;
//       joinBtn.textContent = 'Start Video Call';
//       isJoining = false;
//     }
//   };

//   // Controls
//   document.getElementById('sc-mic').onclick = () => {
//     if (!meeting) return;
//     micOn ? meeting.muteMic() : meeting.unmuteMic();
//     micOn = !micOn;
//     const el = document.getElementById('sc-mic');
//     el.textContent = micOn ? '🎤' : '🔇';
//     el.className = `sc-ctrl ${micOn ? 'sc-ctrl-on' : 'sc-ctrl-off'}`;
//   };

//   document.getElementById('sc-cam').onclick = () => {
//     if (!meeting) return;
//     camOn ? meeting.disableWebcam() : meeting.enableWebcam();
//     camOn = !camOn;
//     const el = document.getElementById('sc-cam');
//     el.textContent = camOn ? '📷' : '🚫';
//     el.className = `sc-ctrl ${camOn ? 'sc-ctrl-on' : 'sc-ctrl-off'}`;
//   };

//   document.getElementById('sc-chat-btn').onclick = () => {
//     const chat = document.getElementById('sc-chat');
//     const btn = document.getElementById('sc-chat-btn');
//     chat.classList.toggle('open');
//     btn.classList.toggle('open');
//     if (chat.classList.contains('open')) {
//       unreadCount = 0;
//       updateChatBadge();
//     }
//   };

//   function updateChatBadge() {
//     const btn = document.getElementById('sc-chat-btn');
//     let badge = btn.querySelector('.badge');
//     if (unreadCount > 0) {
//       if (!badge) { badge = document.createElement('span'); badge.className = 'badge'; btn.appendChild(badge); }
//       badge.textContent = unreadCount;
//       btn.classList.add('notify');
//       setTimeout(() => btn.classList.remove('notify'), 900);
//     } else {
//       if (badge) badge.remove();
//     }
//   }
//   document.getElementById('sc-chat-close').onclick = () => {
//     document.getElementById('sc-chat').classList.remove('open');
//     document.getElementById('sc-chat-btn').classList.remove('open');
//   };

//   document.getElementById('sc-chat-send').onclick = sendChat;
//   document.getElementById('sc-chat-text').onkeydown = (e) => { if (e.key === 'Enter') sendChat(); };

//   function sendChat() {
//     const input = document.getElementById('sc-chat-text');
//     const msg = input.value.trim();
//     if (!msg || !socket || !currentCallId) return;
//     const name = document.getElementById('sc-name').value || 'Shopper';
//     socket.emit('chat-message', { callId: currentCallId, sender: name, senderRole: 'shopper', message: msg });
//     addChatMsg('You', msg, true);
//     input.value = '';
//   }

//   function addChatMsg(name, text, isMe) {
//     const msgs = document.getElementById('sc-chat-msgs');
//     const div = document.createElement('div');
//     div.innerHTML = `<div class="sc-msg-name">${isMe ? '' : name}</div><div class="sc-msg ${isMe ? 'sc-msg-me' : 'sc-msg-them'}">${text}</div>`;
//     msgs.appendChild(div);
//     msgs.scrollTop = msgs.scrollHeight;
//   }

//   // PiP Drag
//   (function initDrag() {
//     let pip, startX, startY, startLeft, startTop, dragging = false;
//     function onStart(e) {
//       pip = document.getElementById('sc-local-pip');
//       if (!pip) return;
//       dragging = true;
//       const t = e.touches ? e.touches[0] : e;
//       const rect = pip.getBoundingClientRect();
//       startX = t.clientX; startY = t.clientY;
//       startLeft = rect.left; startTop = rect.top;
//       pip.style.transition = 'none';
//     }
//     function onMove(e) {
//       if (!dragging || !pip) return;
//       e.preventDefault();
//       const t = e.touches ? e.touches[0] : e;
//       const dx = t.clientX - startX, dy = t.clientY - startY;
//       const parent = pip.parentElement.getBoundingClientRect();
//       let newLeft = startLeft - parent.left + dx;
//       let newTop = startTop - parent.top + dy;
//       newLeft = Math.max(0, Math.min(parent.width - pip.offsetWidth, newLeft));
//       newTop = Math.max(0, Math.min(parent.height - pip.offsetHeight, newTop));
//       pip.style.left = newLeft + 'px';
//       pip.style.top = newTop + 'px';
//       pip.style.right = 'auto';
//       pip.style.bottom = 'auto';
//     }
//     function onEnd() { dragging = false; if (pip) pip.style.transition = ''; }
//     document.addEventListener('mousedown', (e) => { if (e.target.closest('#sc-local-pip')) onStart(e); });
//     document.addEventListener('mousemove', onMove);
//     document.addEventListener('mouseup', onEnd);
//     document.addEventListener('touchstart', (e) => { if (e.target.closest('#sc-local-pip')) onStart(e); }, { passive: false });
//     document.addEventListener('touchmove', onMove, { passive: false });
//     document.addEventListener('touchend', onEnd);
//   })();

//   function endCall() {
//     if (meeting) { try { meeting.leave(); } catch(e){} meeting = null; }
//     if (socket) { socket.disconnect(); socket = null; }
//     if (currentCallId) {
//       fetch(`${API_BASE}/video/end-call`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callId: currentCallId }) }).catch(() => {});
//       currentCallId = null;
//     }
//     isJoining = false; micOn = true; camOn = true;
//     const joinBtn = document.getElementById('sc-join-btn');
//     if (joinBtn) { joinBtn.disabled = false; joinBtn.textContent = 'Start Video Call'; }
//     callEl.classList.remove('active');
//     document.getElementById('sc-call-videos').querySelectorAll('video').forEach(v => v.remove());
//     const remoteAudio = document.getElementById('sc-remote-audio');
//     if (remoteAudio) remoteAudio.remove();
//     document.getElementById('sc-local-pip').innerHTML = '';
//     document.getElementById('sc-call-waiting').style.display = 'flex';
//     document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Waiting for agent...';
//     document.getElementById('sc-chat-msgs').innerHTML = '';
//     document.getElementById('sc-chat').classList.remove('open');
//     document.getElementById('sc-mic').className = 'sc-ctrl sc-ctrl-on';
//     document.getElementById('sc-mic').textContent = '🎤';
//     document.getElementById('sc-cam').className = 'sc-ctrl sc-ctrl-on';
//     document.getElementById('sc-cam').textContent = '📷';
//   }

//   document.getElementById('sc-end').onclick = endCall;
//   window.addEventListener('beforeunload', () => {
//     if (meeting) { try { meeting.leave(); } catch(e){} }
//     if (currentCallId) navigator.sendBeacon(`${API_BASE}/video/end-call`, JSON.stringify({ callId: currentCallId }));
//   });
// })();
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
    layoutTB: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/></svg>',
    layoutLR: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="18" rx="2"/><rect x="13" y="3" width="8" height="18" rx="2"/></svg>',
    layoutSpot: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="15" y="12" width="6" height="5" rx="1"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18 8l-6 4-6-4"/><circle cx="12" cy="17" r="3"/><path d="M12 20v2"/></svg>',
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
    #sc-call.minimized{position:fixed;inset:auto;width:270px;height:420px;border-radius:18px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);cursor:move;background:#0a0a12;animation:scMinDrop .25s cubic-bezier(.4,0,.2,1)}
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
    #sc-videos{flex:1;min-width:0;position:relative;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#13131a,#0e0e16);box-shadow:0 18px 48px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.04) inset;display:flex}
    #sc-call.minimized #sc-videos{border-radius:0}

    /* Video boxes */
    .sc-vid-box{position:relative;overflow:hidden;background:#13131a;display:flex;align-items:center;justify-content:center}
    .sc-vid-box video{width:100%;height:100%;object-fit:cover;pointer-events:none}
    .sc-vid-box.sc-vid-local video{transform:scaleX(-1)}
    .sc-vid-box.sc-no-video::after{content:attr(data-name);color:#71717a;font-size:11px;font-weight:500}
    .sc-vid-box .sc-vid-label{position:absolute;bottom:8px;left:8px;font-size:10px;font-weight:500;color:#f4f4f5;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);padding:3px 8px;border-radius:6px;z-index:3}
    .sc-vid-box.sc-pinned{outline:2px solid rgba(99,102,241,.7);outline-offset:-2px}

    /* Layout: Spotlight (default) — remote full, local as PiP overlay */
    .sc-layout-spot{flex-direction:column}
    .sc-layout-spot .sc-vid-main{flex:1;min-height:0}
    .sc-layout-spot .sc-vid-pip{position:absolute;top:14px;right:14px;width:140px;height:200px;border-radius:14px;border:2px solid rgba(255,255,255,.12);z-index:5;touch-action:none;cursor:grab;box-shadow:0 12px 32px rgba(0,0,0,.5)}
    .sc-layout-spot .sc-vid-pip:active{cursor:grabbing;box-shadow:0 16px 40px rgba(0,0,0,.7)}

    /* Layout: Top-Bottom */
    .sc-layout-tb{flex-direction:column;gap:4px}
    .sc-layout-tb .sc-vid-box{flex:1;min-height:0;border-radius:12px;position:relative}
    .sc-layout-tb .sc-vid-pip{position:relative;top:auto;right:auto;width:auto;height:auto;border:none;cursor:default;box-shadow:none}

    /* Layout: Left-Right */
    .sc-layout-lr{flex-direction:row;gap:4px}
    .sc-layout-lr .sc-vid-box{flex:1;min-width:0;border-radius:12px;position:relative}
    .sc-layout-lr .sc-vid-pip{position:relative;top:auto;right:auto;width:auto;height:auto;border:none;cursor:default;box-shadow:none}

    /* Pinned swap — when self is pinned, local becomes main */
    .sc-vid-box.sc-vid-main.sc-self-main{order:0}
    .sc-vid-box.sc-vid-pip.sc-self-main{order:1}

    #sc-waiting{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#a1a1aa;z-index:2;background:radial-gradient(400px 300px at 50% 40%,rgba(99,102,241,.15),transparent 60%)}
    .sc-spinner{width:32px;height:32px;border:3px solid rgba(255,255,255,.08);border-top-color:#6366f1;border-radius:50%;animation:scSpin .9s linear infinite}
    @keyframes scSpin{to{transform:rotate(360deg)}}
    #sc-waiting p{font-size:14px;font-weight:500;color:#f4f4f5}
    #sc-waiting .sc-waiting-hint{font-size:12px;color:#71717a}

    /* Local PiP — minimized mode override */
    #sc-call.minimized .sc-vid-pip{width:82px;height:112px;top:30px;right:8px;border-radius:10px}

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
    .sc-bar-inner{display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 14px;background:rgba(20,20,28,.78);backdrop-filter:blur(28px) saturate(1.4);-webkit-backdrop-filter:blur(28px) saturate(1.4);border:1px solid rgba(255,255,255,.06);border-radius:22px;box-shadow:0 18px 48px rgba(0,0,0,.5);flex-wrap:wrap}
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

    /* Minimize — top status */
    .sc-min-top{position:absolute;top:0;left:0;right:0;display:none;align-items:center;gap:6px;padding:8px 12px;background:linear-gradient(180deg,rgba(0,0,0,.6),transparent);z-index:10;font-size:11px;font-weight:600;color:#f4f4f5;pointer-events:none}
    #sc-call.minimized .sc-min-top{display:flex}
    .sc-min-live-dot{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 6px rgba(16,185,129,.7);animation:scPulse 2s ease infinite}

    /* Minimize — bottom controls bar */
    .sc-min-bar{position:absolute;bottom:0;left:0;right:0;display:none;align-items:center;justify-content:space-between;padding:10px 10px;background:linear-gradient(0deg,rgba(0,0,0,.75) 60%,transparent);z-index:10;cursor:default}
    #sc-call.minimized .sc-min-bar{display:flex}
    .sc-min-left{display:flex;gap:6px}
    .sc-min-btn{width:28px;height:28px;border-radius:8px;border:none;background:rgba(255,255,255,.15);color:#f4f4f5;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .12s,transform .12s}
    .sc-min-btn:hover{background:rgba(255,255,255,.25)}
    .sc-min-btn:active{transform:scale(.9)}
    .sc-min-btn-expand{width:36px;height:36px;border-radius:10px;background:rgba(99,102,241,.85);color:#fff;box-shadow:0 4px 12px rgba(99,102,241,.4)}
    .sc-min-btn-expand:hover{background:rgba(99,102,241,1)}
    .sc-min-btn-danger{background:rgba(239,68,68,.85);margin-left:auto}
    .sc-min-btn-danger:hover{background:rgba(239,68,68,1)}

    /* Toast */
    #sc-toast{position:fixed;bottom:110px;left:50%;transform:translateX(-50%);padding:10px 16px;border-radius:11px;font-size:13px;font-weight:500;background:rgba(22,22,30,.96);border:1px solid rgba(255,255,255,.08);color:#f4f4f5;backdrop-filter:blur(16px);box-shadow:0 18px 48px rgba(0,0,0,.5);z-index:100002;display:none;animation:scToast .25s ease}
    @keyframes scToast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    #sc-toast.success{border-color:rgba(16,185,129,.4);color:#6ee7b7}
    #sc-toast.error{border-color:rgba(239,68,68,.4);color:#fca5a5}
    #sc-toast.warn{border-color:rgba(245,158,11,.4);color:#fcd34d}

    /* Responsive */
    /* ── xl (1024+) — default styles above handle this ── */

    /* ── lg (768-1024px) — tablets landscape ── */
    @media(max-width:1024px){
      #sc-chat{width:280px}
      .sc-layout-spot .sc-vid-pip{width:120px;height:170px}
    }

    /* ── md (480-768px) — tablets portrait, large phones landscape ── */
    @media(max-width:768px){
      #sc-call.minimized{width:240px;height:375px}
      #sc-top{padding:10px 14px}
      .sc-brand{font-size:12px}
      .sc-status{font-size:11px;padding:4px 7px}
      .sc-top-btn{width:28px;height:28px;border-radius:7px}
      #sc-stage{padding:4px 10px 0;gap:10px}
      .sc-layout-spot .sc-vid-pip{width:110px;height:155px;top:12px;right:12px;border-radius:12px}
      #sc-chat{width:260px;border-radius:14px}
      .sc-chat-head{padding:11px 14px}
      .sc-chat-msgs{padding:12px}
      .sc-chat-input input{padding:8px 10px;font-size:12px}
      #sc-bar{padding:12px 12px 16px}
      .sc-bar-inner{gap:8px;padding:9px 12px;border-radius:20px}
      .sc-ctrl{width:44px;height:44px;border-radius:13px}
      .sc-ctrl-hang{width:58px}
      #sc-waiting p{font-size:13px}
      #sc-waiting .sc-waiting-hint{font-size:11px}
      .sc-spinner{width:28px;height:28px}
      #sc-toast{bottom:100px;font-size:12px;padding:9px 14px}
    }

    /* ── sm (380-480px) — standard phones ── */
    @media(max-width:600px){
      #sc-call.minimized{width:225px;height:345px}
      #sc-call.minimized .sc-vid-pip{width:72px;height:97px;top:7px;right:7px;border-radius:9px}
      /* On phones, left-right becomes top-bottom */
      .sc-layout-lr{flex-direction:column;gap:4px}
      .sc-layout-spot .sc-vid-pip{width:90px;height:125px;top:8px;right:8px;border-radius:10px}
      #sc-top{padding:8px 12px}
      .sc-brand{font-size:11px;gap:6px}
      .sc-brand-dot{width:7px;height:7px}
      .sc-status{font-size:10px;padding:3px 6px;gap:5px}
      .sc-status-live{width:5px;height:5px}
      .sc-top-btn{width:26px;height:26px}
      #sc-stage{padding:4px 8px 0;gap:8px}
      #sc-videos{border-radius:14px}
      #sc-chat{position:fixed;inset:0;width:100%;border-radius:0;margin:0;z-index:30}
      .sc-chat-head{padding:12px 14px}
      .sc-chat-head h3{font-size:14px}
      .sc-chat-msgs{padding:12px 10px}
      .sc-chat-input{padding:8px}
      .sc-chat-input input{padding:10px 12px;font-size:14px}
      .sc-chat-input button{padding:0 12px}
      #sc-bar{padding:10px 8px 14px}
      .sc-bar-inner{gap:6px;padding:8px 10px;border-radius:18px;max-width:320px}
      .sc-ctrl{width:42px;height:42px;border-radius:12px}
      .sc-ctrl-hang{width:54px}
      .sc-more-pop{min-width:180px}
      .sc-more-item{padding:8px 10px;font-size:12px}
      .sc-modal{padding:22px;border-radius:16px;max-width:340px}
      .sc-modal-head{gap:10px;margin-bottom:14px}
      .sc-modal-icon{width:36px;height:36px;border-radius:9px}
      .sc-modal-title{font-size:15px}
      .sc-modal-subtitle{font-size:11px}
      .sc-modal input{padding:10px 12px;font-size:13px}
      .sc-btn-primary{padding:12px;font-size:13px;margin-top:14px}
      .sc-trust-row{gap:10px;font-size:10px;margin-top:12px}
      #sc-waiting p{font-size:13px}
      #sc-waiting .sc-waiting-hint{font-size:11px}
      .sc-spinner{width:26px;height:26px;border-width:2.5px}
      #sc-toast{bottom:90px;font-size:12px;padding:8px 14px;border-radius:9px}
      .sc-min-top{padding:6px 10px;font-size:9px}
      .sc-min-bar{padding:8px 8px}
      .sc-min-btn{width:24px;height:24px;border-radius:6px}
      .sc-min-btn-expand{width:30px;height:30px;border-radius:8px}
    }

    /* ── xs (<380px) — small phones ── */
    @media(max-width:380px){
      #sc-call.minimized{width:195px;height:300px}
      #sc-call.minimized .sc-vid-pip{width:60px;height:82px;top:6px;right:6px;border-radius:8px}
      .sc-layout-spot .sc-vid-pip{width:75px;height:105px;top:6px;right:6px;border-radius:8px}
      #sc-top{padding:6px 10px}
      .sc-brand{font-size:10px;gap:5px}
      .sc-brand-dot{width:6px;height:6px}
      .sc-status{font-size:9px;padding:3px 5px}
      .sc-top-btn{width:24px;height:24px;border-radius:6px}
      #sc-stage{padding:3px 6px 0}
      #sc-videos{border-radius:12px}
      #sc-bar{padding:8px 6px 12px}
      .sc-bar-inner{gap:4px;padding:7px 8px;border-radius:16px}
      .sc-ctrl{width:38px;height:38px;border-radius:11px}
      .sc-ctrl-hang{width:48px}
      .sc-more-pop{min-width:160px;border-radius:10px}
      .sc-more-item{padding:7px 9px;font-size:11px;gap:8px}
      .sc-modal{padding:18px;border-radius:14px;max-width:300px}
      .sc-modal-head{gap:8px;margin-bottom:12px}
      .sc-modal-icon{width:32px;height:32px;border-radius:8px}
      .sc-modal-title{font-size:14px}
      .sc-modal-subtitle{font-size:10px}
      .sc-input-label{font-size:10px}
      .sc-modal input{padding:9px 10px;font-size:13px;border-radius:8px}
      .sc-btn-primary{padding:11px;font-size:13px;border-radius:9px;margin-top:12px}
      .sc-btn-ghost{font-size:12px;padding:8px}
      .sc-trust-row{gap:8px;font-size:9px;margin-top:10px}
      #sc-waiting p{font-size:12px}
      #sc-waiting .sc-waiting-hint{font-size:10px}
      .sc-spinner{width:22px;height:22px;border-width:2px}
      #sc-toast{bottom:80px;font-size:11px;padding:7px 12px;border-radius:8px;max-width:85vw}
      .sc-min-top{padding:5px 8px;font-size:9px}
      .sc-min-bar{padding:7px 7px}
      .sc-min-btn{width:22px;height:22px;border-radius:5px}
      .sc-min-btn-expand{width:28px;height:28px;border-radius:7px}
      .sc-msg-bubble{padding:7px 10px;font-size:12px}
    }

    /* ── Landscape mobile ── */
    @media(max-height:440px) and (orientation:landscape){
      #sc-top{padding:6px 14px}
      .sc-brand{font-size:11px}
      .sc-status{font-size:10px}
      #sc-stage{padding:2px 8px 0}
      .sc-layout-spot .sc-vid-pip{width:80px;height:60px;top:6px;right:6px;border-radius:8px}
      /* In landscape, left-right works great */
      #sc-bar{padding:6px 8px 10px}
      .sc-bar-inner{padding:6px 10px;gap:6px}
      .sc-ctrl{width:36px;height:36px;border-radius:10px}
      .sc-ctrl-hang{width:48px}
      #sc-waiting p{font-size:12px}
      .sc-spinner{width:22px;height:22px}
      #sc-call.minimized{width:210px;height:300px}
    }

    /* ── Button responsive ── */
    @media(max-width:480px){
      #sc-btn{padding:11px 18px 11px 14px;font-size:13px;gap:6px}
      #sc-btn .sc-btn-pulse{width:7px;height:7px}
    }
    @media(max-width:380px){
      #sc-btn{padding:10px 14px 10px 12px;font-size:12px;gap:5px;border-radius:40px}
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
    <div class="sc-min-top">
      <span class="sc-min-live-dot"></span>
      <span>Live · <span id="sc-min-timer">0:00</span></span>
    </div>
    <div class="sc-min-bar">
      <div class="sc-min-left">
        <button class="sc-min-btn" id="sc-min-mic" title="Mic">${SVG.mic}</button>
        <button class="sc-min-btn" id="sc-min-cam" title="Camera">${SVG.cam}</button>
      </div>
      <button class="sc-min-btn sc-min-btn-expand" id="sc-min-expand" title="Expand">${SVG.expand.replace('width="14"','width="16"').replace('height="14"','height="16"')}</button>
      <button class="sc-min-btn sc-min-btn-danger" id="sc-min-end" title="End">${SVG.hang}</button>
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
      <div id="sc-videos" class="sc-layout-spot">
        <div id="sc-waiting">
          <div class="sc-spinner"></div>
          <p>Waiting for our team to connect…</p>
          <span class="sc-waiting-hint">This usually takes under 30 seconds</span>
        </div>
        <div id="sc-vid-remote" class="sc-vid-box sc-vid-main"></div>
        <div id="sc-vid-local" class="sc-vid-box sc-vid-pip"></div>
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
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl" id="sc-layout" title="Layout">${SVG.layoutSpot}</button>
        </div>
        <div class="sc-ctrl-wrap">
          <button class="sc-ctrl" id="sc-pin" title="Pin self">${SVG.pin}</button>
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
  const vidLocal = $('sc-vid-local');
  const vidRemote = $('sc-vid-remote');
  const videos = $('sc-videos');
  const waiting = $('sc-waiting');
  const chat = $('sc-chat');
  const chatBtn = $('sc-chat-btn');
  const micBtn = $('sc-mic');
  const camBtn = $('sc-cam');
  const flipBtn = $('sc-flip');
  const blurBtn = $('sc-blur');
  const layoutBtn = $('sc-layout');
  const pinBtn = $('sc-pin');
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
  let layout = 'spot'; // 'spot' | 'tb' | 'lr'
  let selfPinned = false;

  // ── Helpers ──────────────────────────────────────────────────────────────
  async function applyCustomTrack(track) {
    if (!meeting) throw new Error('No meeting');
    try { return await meeting.changeWebcam({ customTrack: track }); } catch (e) {}
    try { return await meeting.changeWebcam(track); } catch (e) {}
    try {
      meeting.disableWebcam();
      await new Promise(r => setTimeout(r, 300));
      return meeting.enableWebcam(track);
    } catch (e) { throw e; }
  }
  async function applyDeviceId(deviceId) {
    if (!meeting) throw new Error('No meeting');
    // Try changeWebcam with deviceId directly
    try { return await meeting.changeWebcam(deviceId); } catch (e) {}
    try { return await meeting.changeWebcam({ deviceId }); } catch (e) {}
    // Fallback: disable and re-enable with a custom track from the new device
    try {
      meeting.disableWebcam();
      await new Promise(r => setTimeout(r, 300));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      const track = stream.getVideoTracks()[0];
      meeting.enableWebcam(track);
      return;
    } catch (e) { throw e; }
  }
  async function getAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'videoinput');
    } catch (e) { return []; }
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
    vidLocal.classList.toggle('sc-no-video', !camOn);
  }
  function updateBlurUI() {
    setCtrlIcon(blurBtn, 'sparkles', blurOn ? 'accent' : null);
  }
  function updateLayoutUI() {
    videos.className = `sc-layout-${layout}`;
    const icons = { spot: 'layoutSpot', tb: 'layoutTB', lr: 'layoutLR' };
    layoutBtn.innerHTML = SVG[icons[layout]];
    layoutBtn.classList.toggle('sc-ctrl-accent', layout !== 'spot');
    // Reset any dragged position
    vidLocal.style.left = ''; vidLocal.style.top = ''; vidLocal.style.right = ''; vidLocal.style.bottom = '';
    vidRemote.style.left = ''; vidRemote.style.top = ''; vidRemote.style.right = ''; vidRemote.style.bottom = '';
    updatePinUI();
  }
  function updatePinUI() {
    pinBtn.classList.toggle('sc-ctrl-accent', selfPinned);
    // Swap order: if selfPinned, local comes first (main), remote second (pip/small)
    if (selfPinned) {
      vidLocal.style.order = '0';
      vidRemote.style.order = '1';
      vidLocal.classList.add('sc-vid-main');
      vidLocal.classList.remove('sc-vid-pip');
      vidRemote.classList.add('sc-vid-pip');
      vidRemote.classList.remove('sc-vid-main');
    } else {
      vidRemote.style.order = '0';
      vidLocal.style.order = '1';
      vidRemote.classList.add('sc-vid-main');
      vidRemote.classList.remove('sc-vid-pip');
      vidLocal.classList.add('sc-vid-pip');
      vidLocal.classList.remove('sc-vid-main');
    }
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
      btn.style.display = 'none'; // Hide launcher during call
      callEl.classList.add('active');
      minimize(); // Start as floating popup so user can keep browsing

      // Wait for VideoSDK + Socket.IO scripts
      await Promise.all([loadScript(SOCKETIO_SRC), loadScript(VIDEOSDK_SRC)]);

      const SOCKET_URL = API_BASE.replace('/api', '');
      socket = window.io(SOCKET_URL);

      // Ensure room is joined on connect and reconnect
      const joinRooms = () => {
        socket.emit('join-room', currentCallId);
        socket.emit('join-room', `call:${currentCallId}`);
      };
      socket.on('connect', joinRooms);
      joinRooms();

      socket.on('chat-message', (msg) => {
        addChatMsg(msg.sender, msg.message, false);
        if (!chat.classList.contains('open')) { unread++; updateChatBadge(); }
      });
      socket.on('call-rejected', () => { showToast('Call ended', 'warn'); endCall(); });
      socket.on('call-accepted', async (roomData) => {
        try {
          await initVideoSDK(roomData, name);
        } catch (e) {
          console.error('[ShopCall] Failed to init video:', e);
          waiting.querySelector('p').textContent = 'Connection failed — please retry';
          showToast('Video connection failed', 'error');
        }
      });

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

    // Wait for VideoSDK to be available (may still be loading)
    if (!window.VideoSDK) {
      await new Promise((resolve, reject) => {
        const check = setInterval(() => { if (window.VideoSDK) { clearInterval(check); resolve(); } }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('VideoSDK load timeout')); }, 10000);
      });
    }

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
      cameras = await getAvailableCameras();
      if (cameras.length > 0) activeCamId = cameras[0].deviceId;
      bindLocalStreams();
    });

    meeting.on('participant-joined', (p) => {
      p.on('stream-enabled', (stream) => {
        if (stream.kind === 'video') {
          let v = vidRemote.querySelector('video');
          if (!v) {
            v = document.createElement('video');
            v.autoplay = true;
            v.playsInline = true;
            vidRemote.appendChild(v);
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
        let v = vidLocal.querySelector('video');
        if (!v) {
          v = document.createElement('video');
          v.autoplay = true;
          v.playsInline = true;
          v.muted = true;
          vidLocal.appendChild(v);
        }
        v.srcObject = new MediaStream([stream.track]);
        vidLocal.classList.remove('sc-no-video');
      }
    });
    meeting.localParticipant.on('stream-disabled', (stream) => {
      if (stream.kind === 'video') {
        const v = vidLocal.querySelector('video');
        if (v) v.srcObject = null;
        vidLocal.classList.add('sc-no-video');
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
    cameras = await getAvailableCameras();
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
    } catch (e) { console.error('[ShopCall] Flip error:', e); showToast('Switch failed', 'error'); }
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

  // Layout cycling: spot → tb → lr → spot
  layoutBtn.onclick = () => {
    const modes = ['spot', 'tb', 'lr'];
    layout = modes[(modes.indexOf(layout) + 1) % modes.length];
    updateLayoutUI();
    const names = { spot: 'Spotlight', tb: 'Top-Bottom', lr: 'Left-Right' };
    showToast(`Layout: ${names[layout]}`, 'info');
  };

  // Pin self — swap which video is prominent
  pinBtn.onclick = () => {
    selfPinned = !selfPinned;
    updatePinUI();
    showToast(selfPinned ? 'Your video pinned' : 'Remote video pinned', 'info');
  };

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
    if (!minPos) minPos = { x: window.innerWidth - 290, y: window.innerHeight - 440 };
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
      if (e.target.closest('.sc-min-btn') || e.target.closest('.sc-min-bar')) return;
      drag = true;
      ox = minPos?.x || 0; oy = minPos?.y || 0;
      sx = e.clientX; sy = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const W = window.innerWidth, H = window.innerHeight;
      const nx = Math.max(8, Math.min(W - 280, ox + (e.clientX - sx)));
      const ny = Math.max(8, Math.min(H - 430, oy + (e.clientY - sy)));
      minPos = { x: nx, y: ny };
      callEl.style.left = nx + 'px';
      callEl.style.top = ny + 'px';
    });
    window.addEventListener('pointerup', () => { drag = false; });
  })();

  // ── Local PiP draggable inside call ──────────────────────────────────────
  (function() {
    let drag = false, sx = 0, sy = 0, ox = 0, oy = 0;
    vidLocal.addEventListener('pointerdown', (e) => {
      if (callEl.classList.contains('minimized')) return;
      if (layout !== 'spot') return; // Only draggable in spotlight mode
      drag = true;
      const r = vidLocal.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY;
      ox = r.left; oy = r.top;
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      e.preventDefault();
      const parent = videos.getBoundingClientRect();
      const el = vidLocal.classList.contains('sc-vid-pip') ? vidLocal : vidRemote;
      const nx = Math.max(0, Math.min(parent.width - el.offsetWidth, ox - parent.left + (e.clientX - sx)));
      const ny = Math.max(0, Math.min(parent.height - el.offsetHeight, oy - parent.top + (e.clientY - sy)));
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
      el.style.right = 'auto'; el.style.bottom = 'auto';
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
    btn.style.display = ''; // Restore launcher button
    // Reset UI
    isJoining = false;
    micOn = true; camOn = true; blurOn = false; unread = 0; pipVideo = null;
    updateMicUI(); updateCamUI(); updateBlurUI(); updateChatBadge();
    $('sc-chat-text').value = '';
    $('sc-chat-msgs').innerHTML = '<div class="sc-chat-empty"><p>No messages yet</p><span>The agent may share product links here</span></div>';
    chat.classList.remove('open');
    waiting.style.display = 'flex';
    waiting.querySelector('p').textContent = 'Waiting for our team to connect…';
    const rv = vidRemote.querySelector('video'); if (rv) rv.remove();
    const a = $('sc-remote-audio'); if (a) a.remove();
    vidLocal.innerHTML = '';
    // Reset layout
    layout = 'spot'; selfPinned = false;
    updateLayoutUI();
    vidLocal.style.order = ''; vidRemote.style.order = '';
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
  updateMicUI(); updateCamUI(); updateBlurUI(); updateLayoutUI();
  vidLocal.dataset.name = 'You';
  vidRemote.dataset.name = 'Agent';
  vidLocal.classList.add('sc-vid-local', 'sc-no-video');
  console.log('[ShopCall] Ready');
})();