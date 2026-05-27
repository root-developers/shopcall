(function() {
  console.log('[ShopCall SDK] Loading...');
  const script = document.currentScript;
  if (!script) return console.error('[ShopCall SDK] ERROR: document.currentScript is null - script may be loaded async/deferred');
  const storeKey = script.getAttribute('data-store');
  const API_BASE = script.src.replace('/sdk/shopcall-sdk.js', '/api');
  console.log('[ShopCall SDK] storeKey:', storeKey, 'API:', API_BASE);
  if (!storeKey) return console.error('[ShopCall SDK] ERROR: data-store attribute missing');

  const btnText = script.getAttribute('data-text') || '📹 Live Shop';
  const btnBg = script.getAttribute('data-bg') || '#6366f1';
  const btnColor = script.getAttribute('data-color') || '#ffffff';
  const btnRadius = script.getAttribute('data-radius') || '50';
  const btnPosition = script.getAttribute('data-position') || 'bottom-right';
  const btnSize = script.getAttribute('data-size') || '14';
  const posMap = { 'bottom-right': 'bottom:24px;right:24px', 'bottom-left': 'bottom:24px;left:24px', 'top-right': 'top:24px;right:24px', 'top-left': 'top:24px;left:24px' };
  const posStyle = posMap[btnPosition] || posMap['bottom-right'];

  // Load Socket.IO client
  const ioScript = document.createElement('script');
  ioScript.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
  document.head.appendChild(ioScript);

  // Load VideoSDK
  const sdkScript = document.createElement('script');
  sdkScript.src = 'https://sdk.videosdk.live/js-sdk/0.0.86/videosdk.js';
  document.head.appendChild(sdkScript);

  let socket = null;

  const style = document.createElement('style');
  style.textContent = `
    #sc-btn{position:fixed;${posStyle};z-index:99999;background:${btnBg};color:${btnColor};border:none;padding:14px 24px;border-radius:${btnRadius}px;font-family:-apple-system,sans-serif;font-size:${btnSize}px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .2s}
    #sc-btn:hover{transform:scale(1.05)}
    #sc-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif}
    #sc-overlay.active{display:flex}
    #sc-modal-box{background:#111;border-radius:16px;padding:28px;width:90%;max-width:380px;color:#fff}
    #sc-modal-box h3{font-size:17px;font-weight:600;margin-bottom:4px}
    #sc-modal-box p.sub{font-size:13px;color:#71717a;margin-bottom:20px}
    #sc-modal-box input{width:100%;padding:12px 14px;border-radius:8px;border:1px solid #27272a;background:#09090b;color:#fff;font-size:14px;box-sizing:border-box;outline:none;transition:border .2s}
    #sc-modal-box input:focus{border-color:#6366f1}
    .sc-btn-primary{background:#6366f1;color:#fff;width:100%;padding:12px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;transition:all .2s}
    .sc-btn-primary:hover{background:#4f46e5}
    .sc-btn-primary:disabled{opacity:.5;cursor:not-allowed}
    .sc-btn-ghost{background:transparent;color:#71717a;width:100%;padding:10px;border:none;font-size:13px;cursor:pointer;margin-top:4px}
    #sc-call{position:fixed;inset:0;z-index:100001;background:#09090b;display:none;flex-direction:column;font-family:-apple-system,sans-serif}
    #sc-call.active{display:flex}
    #sc-call-videos{flex:1;position:relative;overflow:hidden}
    #sc-call-videos video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    #sc-local-pip{position:absolute;top:12px;right:12px;width:100px;height:140px;border-radius:12px;overflow:hidden;border:2px solid #27272a;z-index:5;background:#18181b;touch-action:none;cursor:grab;transition:box-shadow .2s}
    #sc-local-pip:active{cursor:grabbing;box-shadow:0 4px 20px rgba(0,0,0,.5)}
    #sc-local-pip video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);pointer-events:none}
    #sc-call-waiting{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#71717a;z-index:2}
    #sc-call-waiting .dot-pulse{width:8px;height:8px;border-radius:50%;background:#6366f1;animation:scPulse 1.2s infinite}
    @keyframes scPulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
    #sc-call-bar{padding:12px 16px;display:flex;align-items:center;justify-content:center;gap:10px;background:#0c0c0e;border-top:1px solid #1f1f23;flex-shrink:0}
    .sc-ctrl{width:44px;height:44px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:all .15s}
    .sc-ctrl:active{transform:scale(.9)}
    .sc-ctrl-on{background:#1f1f23;color:#fff}
    .sc-ctrl-off{background:#ef4444;color:#fff}
    .sc-ctrl-end{width:52px;border-radius:22px;background:#ef4444;color:#fff}
    .sc-ctrl-chat{background:#1f1f23;color:#fff;position:relative}
    .sc-ctrl-chat.open{background:#6366f1}
    .sc-ctrl-chat .badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 4px}
    @keyframes scBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .sc-ctrl-chat.notify{animation:scBounce .4s ease 2}
    #sc-chat{position:absolute;bottom:0;right:0;top:0;width:280px;background:#0f0f11;border-left:1px solid #1f1f23;display:none;flex-direction:column;z-index:10}
    #sc-chat.open{display:flex}
    #sc-chat-head{padding:10px 14px;border-bottom:1px solid #1f1f23;display:flex;align-items:center;justify-content:space-between}
    #sc-chat-head h4{font-size:13px;font-weight:600;color:#f4f4f5}
    #sc-chat-msgs{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:6px}
    .sc-msg{max-width:85%;padding:8px 12px;border-radius:10px;font-size:12px;color:#f4f4f5;word-break:break-word}
    .sc-msg-me{align-self:flex-end;background:#6366f1;border-bottom-right-radius:2px}
    .sc-msg-them{align-self:flex-start;background:#1f1f23;border-bottom-left-radius:2px}
    .sc-msg-name{font-size:10px;color:#52525b;margin-bottom:2px}
    #sc-chat-input{display:flex;gap:6px;padding:10px;border-top:1px solid #1f1f23}
    #sc-chat-input input{flex:1;padding:8px 10px;border-radius:6px;border:1px solid #1f1f23;background:#09090b;color:#fff;font-size:12px;outline:none}
    #sc-chat-input button{background:#6366f1;border:none;border-radius:6px;color:#fff;padding:8px 12px;font-size:11px;font-weight:600;cursor:pointer}
    @media(max-width:500px){#sc-chat{width:100%;left:0}#sc-local-pip{width:80px;height:110px;top:8px;right:8px}}
  `;
  document.head.appendChild(style);

  // Button
  const btn = document.createElement('button');
  btn.id = 'sc-btn';
  btn.textContent = btnText;
  document.body.appendChild(btn);
  console.log('[ShopCall SDK] Button created:', btn.id, 'text:', btnText);

  // Modal
  const overlay = document.createElement('div');
  overlay.id = 'sc-overlay';
  overlay.innerHTML = `<div id="sc-modal-box">
    <h3>Talk to us live</h3>
    <p class="sub">Connect with our team via video call</p>
    <input id="sc-name" placeholder="Your name" />
    <input id="sc-phone" placeholder="Phone number (optional)" type="tel" style="margin-bottom:4px" />
    <p style="font-size:10px;color:#52525b;margin-bottom:12px">If disconnected, we'll call you back</p>
    <button class="sc-btn-primary" id="sc-join-btn">Start Video Call</button>
    <button class="sc-btn-ghost" id="sc-cancel-btn">Cancel</button>
    <p id="sc-error" style="color:#ef4444;font-size:12px;margin-top:8px;display:none"></p>
  </div>`;
  document.body.appendChild(overlay);

  // Call screen
  const callEl = document.createElement('div');
  callEl.id = 'sc-call';
  callEl.innerHTML = `
    <div id="sc-call-videos">
      <div id="sc-call-waiting"><div class="dot-pulse"></div><p>Waiting for agent...</p></div>
      <div id="sc-local-pip"></div>
      <div id="sc-chat">
        <div id="sc-chat-head"><h4>Chat</h4><button id="sc-chat-close" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:14px">✕</button></div>
        <div id="sc-chat-msgs"></div>
        <div id="sc-chat-input"><input id="sc-chat-text" placeholder="Type a message..."/><button id="sc-chat-send">Send</button></div>
      </div>
    </div>
    <div id="sc-call-bar">
      <button class="sc-ctrl sc-ctrl-on" id="sc-mic">🎤</button>
      <button class="sc-ctrl sc-ctrl-on" id="sc-cam">📷</button>
      <button class="sc-ctrl sc-ctrl-chat" id="sc-chat-btn">💬</button>
      <button class="sc-ctrl sc-ctrl-end" id="sc-end">📞</button>
    </div>`;
  document.body.appendChild(callEl);

  let meeting = null, currentCallId = null, isJoining = false, micOn = true, camOn = true, unreadCount = 0;

  btn.onclick = () => overlay.classList.add('active');
  const closeModal = () => overlay.classList.remove('active');
  document.getElementById('sc-cancel-btn').onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (callEl.classList.contains('active')) endCall(); else closeModal(); } });

  document.getElementById('sc-join-btn').onclick = async () => {
    if (isJoining) return;
    isJoining = true;
    const joinBtn = document.getElementById('sc-join-btn');
    joinBtn.disabled = true;
    joinBtn.textContent = 'Connecting...';
    const name = document.getElementById('sc-name').value || 'Shopper';
    const phone = document.getElementById('sc-phone').value || '';
    const errEl = document.getElementById('sc-error');
    errEl.style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/video/join-meeting`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sdkKey: storeKey, shopperName: name, shopperPhone: phone }) });
      const data = await res.json();
      if (!res.ok) { errEl.textContent = data.error; errEl.style.display = 'block'; joinBtn.disabled = false; joinBtn.textContent = 'Start Video Call'; isJoining = false; return; }

      currentCallId = data.callId;
      closeModal();
      callEl.classList.add('active');
      document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Waiting for agent to accept...';

      // Connect socket — wait for agent to accept
      const SOCKET_URL = API_BASE.replace('/api', '');
      socket = window.io(SOCKET_URL);
      socket.emit('join-room', data.callId);
      socket.emit('join-room', `call:${data.callId}`);
      socket.on('chat-message', (msg) => {
        addChatMsg(msg.sender, msg.message, false);
        const chatPanel = document.getElementById('sc-chat');
        if (!chatPanel.classList.contains('open')) { unreadCount++; updateChatBadge(); }
      });

      // Wait for agent to accept — THEN join VideoSDK (saves billing)
      socket.on('call-accepted', async (roomData) => {
        document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Connecting video...';

        if (!window.VideoSDK) {
          await new Promise((resolve, reject) => {
            const check = setInterval(() => { if (window.VideoSDK) { clearInterval(check); resolve(); } }, 100);
            setTimeout(() => { clearInterval(check); reject(new Error('timeout')); }, 10000);
          });
        }

        window.VideoSDK.config(roomData.token);
        meeting = window.VideoSDK.initMeeting({ meetingId: roomData.meetingId, name, micEnabled: true, webcamEnabled: true });

        meeting.on('meeting-joined', () => {
          document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Connected!';
          setTimeout(() => { document.getElementById('sc-call-waiting').style.display = 'none'; }, 500);
          meeting.localParticipant.on('stream-enabled', (stream) => {
            if (stream.kind === 'video') {
              const pip = document.getElementById('sc-local-pip');
              let v = pip.querySelector('video');
              if (!v) { v = document.createElement('video'); v.autoplay = true; v.playsInline = true; v.muted = true; pip.appendChild(v); }
              v.srcObject = new MediaStream([stream.track]);
            }
          });
          meeting.localParticipant.on('stream-disabled', (stream) => {
            if (stream.kind === 'video') { const v = document.getElementById('sc-local-pip')?.querySelector('video'); if (v) v.srcObject = null; }
          });
        });

        meeting.on('participant-joined', (p) => {
          p.on('stream-enabled', (stream) => {
            if (stream.kind === 'video') {
              const vids = document.getElementById('sc-call-videos');
              let v = vids.querySelector('#sc-remote-video');
              if (!v) { v = document.createElement('video'); v.id = 'sc-remote-video'; v.autoplay = true; v.playsInline = true; vids.insertBefore(v, vids.firstChild); }
              v.srcObject = new MediaStream([stream.track]);
            }
            if (stream.kind === 'audio') {
              let a = document.getElementById('sc-remote-audio');
              if (!a) { a = document.createElement('audio'); a.id = 'sc-remote-audio'; a.autoplay = true; document.body.appendChild(a); }
              a.srcObject = new MediaStream([stream.track]);
            }
          });
        });

        meeting.on('participant-left', () => endCall());
        meeting.join();
      });

      // If call gets rejected/cancelled by agent
      socket.on('call-rejected', () => { endCall(); });

    } catch (err) {
      errEl.textContent = 'Connection failed. Try again.';
      errEl.style.display = 'block';
      callEl.classList.remove('active');
      joinBtn.disabled = false;
      joinBtn.textContent = 'Start Video Call';
      isJoining = false;
    }
  };

  // Controls
  document.getElementById('sc-mic').onclick = () => {
    if (!meeting) return;
    micOn ? meeting.muteMic() : meeting.unmuteMic();
    micOn = !micOn;
    const el = document.getElementById('sc-mic');
    el.textContent = micOn ? '🎤' : '🔇';
    el.className = `sc-ctrl ${micOn ? 'sc-ctrl-on' : 'sc-ctrl-off'}`;
  };

  document.getElementById('sc-cam').onclick = () => {
    if (!meeting) return;
    camOn ? meeting.disableWebcam() : meeting.enableWebcam();
    camOn = !camOn;
    const el = document.getElementById('sc-cam');
    el.textContent = camOn ? '📷' : '🚫';
    el.className = `sc-ctrl ${camOn ? 'sc-ctrl-on' : 'sc-ctrl-off'}`;
  };

  document.getElementById('sc-chat-btn').onclick = () => {
    const chat = document.getElementById('sc-chat');
    const btn = document.getElementById('sc-chat-btn');
    chat.classList.toggle('open');
    btn.classList.toggle('open');
    if (chat.classList.contains('open')) {
      unreadCount = 0;
      updateChatBadge();
    }
  };

  function updateChatBadge() {
    const btn = document.getElementById('sc-chat-btn');
    let badge = btn.querySelector('.badge');
    if (unreadCount > 0) {
      if (!badge) { badge = document.createElement('span'); badge.className = 'badge'; btn.appendChild(badge); }
      badge.textContent = unreadCount;
      btn.classList.add('notify');
      setTimeout(() => btn.classList.remove('notify'), 900);
    } else {
      if (badge) badge.remove();
    }
  }
  document.getElementById('sc-chat-close').onclick = () => {
    document.getElementById('sc-chat').classList.remove('open');
    document.getElementById('sc-chat-btn').classList.remove('open');
  };

  document.getElementById('sc-chat-send').onclick = sendChat;
  document.getElementById('sc-chat-text').onkeydown = (e) => { if (e.key === 'Enter') sendChat(); };

  function sendChat() {
    const input = document.getElementById('sc-chat-text');
    const msg = input.value.trim();
    if (!msg || !socket || !currentCallId) return;
    const name = document.getElementById('sc-name').value || 'Shopper';
    socket.emit('chat-message', { callId: currentCallId, sender: name, senderRole: 'shopper', message: msg });
    addChatMsg('You', msg, true);
    input.value = '';
  }

  function addChatMsg(name, text, isMe) {
    const msgs = document.getElementById('sc-chat-msgs');
    const div = document.createElement('div');
    div.innerHTML = `<div class="sc-msg-name">${isMe ? '' : name}</div><div class="sc-msg ${isMe ? 'sc-msg-me' : 'sc-msg-them'}">${text}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // PiP Drag
  (function initDrag() {
    let pip, startX, startY, startLeft, startTop, dragging = false;
    function onStart(e) {
      pip = document.getElementById('sc-local-pip');
      if (!pip) return;
      dragging = true;
      const t = e.touches ? e.touches[0] : e;
      const rect = pip.getBoundingClientRect();
      startX = t.clientX; startY = t.clientY;
      startLeft = rect.left; startTop = rect.top;
      pip.style.transition = 'none';
    }
    function onMove(e) {
      if (!dragging || !pip) return;
      e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - startX, dy = t.clientY - startY;
      const parent = pip.parentElement.getBoundingClientRect();
      let newLeft = startLeft - parent.left + dx;
      let newTop = startTop - parent.top + dy;
      newLeft = Math.max(0, Math.min(parent.width - pip.offsetWidth, newLeft));
      newTop = Math.max(0, Math.min(parent.height - pip.offsetHeight, newTop));
      pip.style.left = newLeft + 'px';
      pip.style.top = newTop + 'px';
      pip.style.right = 'auto';
      pip.style.bottom = 'auto';
    }
    function onEnd() { dragging = false; if (pip) pip.style.transition = ''; }
    document.addEventListener('mousedown', (e) => { if (e.target.closest('#sc-local-pip')) onStart(e); });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchstart', (e) => { if (e.target.closest('#sc-local-pip')) onStart(e); }, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  })();

  function endCall() {
    if (meeting) { try { meeting.leave(); } catch(e){} meeting = null; }
    if (socket) { socket.disconnect(); socket = null; }
    if (currentCallId) {
      fetch(`${API_BASE}/video/end-call`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callId: currentCallId }) }).catch(() => {});
      currentCallId = null;
    }
    isJoining = false; micOn = true; camOn = true;
    const joinBtn = document.getElementById('sc-join-btn');
    if (joinBtn) { joinBtn.disabled = false; joinBtn.textContent = 'Start Video Call'; }
    callEl.classList.remove('active');
    document.getElementById('sc-call-videos').querySelectorAll('video').forEach(v => v.remove());
    const remoteAudio = document.getElementById('sc-remote-audio');
    if (remoteAudio) remoteAudio.remove();
    document.getElementById('sc-local-pip').innerHTML = '';
    document.getElementById('sc-call-waiting').style.display = 'flex';
    document.getElementById('sc-call-waiting').querySelector('p').textContent = 'Waiting for agent...';
    document.getElementById('sc-chat-msgs').innerHTML = '';
    document.getElementById('sc-chat').classList.remove('open');
    document.getElementById('sc-mic').className = 'sc-ctrl sc-ctrl-on';
    document.getElementById('sc-mic').textContent = '🎤';
    document.getElementById('sc-cam').className = 'sc-ctrl sc-ctrl-on';
    document.getElementById('sc-cam').textContent = '📷';
  }

  document.getElementById('sc-end').onclick = endCall;
  window.addEventListener('beforeunload', () => {
    if (meeting) { try { meeting.leave(); } catch(e){} }
    if (currentCallId) navigator.sendBeacon(`${API_BASE}/video/end-call`, JSON.stringify({ callId: currentCallId }));
  });
})();
