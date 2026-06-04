import React, { useState, useEffect } from 'react';
import { API } from '../App';

const DEFAULT_DEMO = {
  title: 'AURA BOUTIQUE',
  subtitle: 'EXCLUSIVE HANDLOOM COLLECTION',
  products: [
    { name: 'Royal Banarasi Silk Saree', price: '₹14,999', desc: 'Handwoven pure silk Banarasi saree with rich zari border and floral motifs. Perfect for bridal events.', img: '🌸' },
    { name: 'Kundan Antique Gold Necklace', price: '₹48,500', desc: 'Traditional Kundan studded choker necklace set in gold plating with matching earrings.', img: '💎' },
    { name: 'Designer Georgette Lehenga', price: '₹34,999', desc: 'Ethereal emerald green lehenga choli set with intricate hand embroidery and sequins work.', img: '👗' }
  ]
};

export default function Demo({ dark, c }) {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('site_content');
      const data = cached ? JSON.parse(cached) : null;
      return data && data.demo ? { ...DEFAULT_DEMO, ...data.demo } : DEFAULT_DEMO;
    } catch {
      return DEFAULT_DEMO;
    }
  });
  const [widgetState, setWidgetState] = useState('closed'); // closed, prompt, ring, connected
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Namaste! Welcome to Aura Boutique. I am Priya. Let me show you the saree details live.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  useEffect(() => {
    document.title = 'Interactive Live Demo | ShopCall';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Experience the ShopCall widget firsthand. Test how customers call sales agents, browse items, and complete purchases on our interactive demo store.');
    window.scrollTo(0, 0);

    fetch(`${API}/site`)
      .then(r => r.json())
      .then(d => {
        if (d && d.demo) {
          setContent({ ...DEFAULT_DEMO, ...d.demo });
          localStorage.setItem('site_content', JSON.stringify(d));
        }
      })
      .catch(() => {});
  }, []);

  const handleStartCall = async (e) => {
    e.preventDefault();
    if (!callerName || !callerPhone) return;
    setWidgetState('ring');
    try {
      await fetch(`${API}/requests/tested-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: callerName, phone: callerPhone })
      });
    } catch (err) {
      console.error('Failed to submit tested lead from demo:', err);
    }
    setTimeout(() => {
      setWidgetState('connected');
    }, 2000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { sender: 'customer', text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');

    // Simulated Agent replies
    setTimeout(() => {
      let replyText = "Sure, let me zoom in on the borders for you.";
      if (chatInput.toLowerCase().includes('price') || chatInput.toLowerCase().includes('discount')) {
        replyText = "I can apply a special live discount code for you: LIVESHOP10. Here is the link to complete your checkout.";
      }
      setChatMessages(prev => [...prev, { sender: 'agent', text: replyText }]);
    }, 1500);
  };

  return (
    <div className="lp-enter" style={{ position: 'relative', minHeight: '100vh', width: '100%', padding: '40px 24px 100px', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Demo Top Banner */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: `1px solid ${c.border}`, borderRadius: 12, padding: '16px 24px', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>Interactive Demo Store Sandbox</h4>
          <p style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>You are viewing a simulated store. Click the floating **Live Shop** button in the bottom right corner to test the video call experience.</p>
        </div>
        <button onClick={() => setWidgetState('prompt')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Try Live Call Now</button>
      </div>

      {/* Simulated Store Front */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{content.title}</h2>
        <p style={{ fontSize: 13, color: c.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 }}>{content.subtitle}</p>
      </div>

      {/* Product Catalog Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }} className="demo-grid">
        {content.products.map((p, idx) => (
          <div key={idx} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
            <div style={{ height: 220, background: dark ? '#16161a' : '#f0f0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
              {p.img || '🛍️'}
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, flex: 1, marginBottom: 16 }}>{p.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{p.price}</span>
                <button style={{ background: 'none', border: `1px solid ${c.border}`, color: c.text, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FLOATING WIDGET BUTTON TRIGGER */}
      {widgetState === 'closed' && (
        <button 
          onClick={() => setWidgetState('prompt')}
          style={{ position: 'fixed', bottom: 30, right: 30, background: '#6366f1', color: '#fff', border: 'none', padding: '16px 28px', borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 1000, animation: 'float 3s ease-in-out infinite' }}
        >
          <span style={{ fontSize: 18 }}>🎥</span> Live Shop
        </button>
      )}

      {/* SIMULATED CALL DIALOG POPUP */}
      {widgetState !== 'closed' && (
        <div style={{ position: 'fixed', bottom: 30, right: 30, width: 360, height: widgetState === 'connected' ? 560 : 420, background: dark ? '#0f0f12' : '#ffffff', border: `1px solid ${c.border}`, borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000, animation: 'lpEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {/* Header */}
          <div style={{ background: '#6366f1', padding: '16px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: widgetState === 'connected' ? '#22c55e' : '#eab308' }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{widgetState === 'connected' ? 'Live Call with Priya' : 'Aura Boutique Live'}</span>
            </div>
            <button onClick={() => setWidgetState('closed')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {/* Widget Body State 1: Prompt Inputs */}
          {widgetState === 'prompt' && (
            <form onSubmit={handleStartCall} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, justifySelf: 'center', flex: 1 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Connect with a Sales Agent</h3>
              <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.5 }}>Our showroom specialist will showcase sarees and answer sizing questions via instant 1-on-1 HD video call.</p>
              
              <input 
                required 
                placeholder="Your Name" 
                value={callerName}
                onChange={e => setCallerName(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#18181b' : '#fafafa', color: c.text, fontSize: 14, outline: 'none' }} 
              />
              <input 
                required 
                type="tel" 
                placeholder="Phone Number" 
                value={callerPhone}
                onChange={e => setCallerPhone(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#18181b' : '#fafafa', color: c.text, fontSize: 14, outline: 'none' }} 
              />
              
              <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>Start Video Call</button>
            </form>
          )}

          {/* Widget Body State 2: Calling/Ringing */}
          {widgetState === 'ring' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, padding: 24 }}>
              <div className="ringing-dot" style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'relative' }}>
                🔔
              </div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Ringing showroom floor...</p>
              <p style={{ fontSize: 12, color: c.muted, textAlign: 'center' }}>Connecting you to the next available boutique agent. Please keep the window open.</p>
            </div>
          )}

          {/* Widget Body State 3: Connected Live Video + Chat */}
          {widgetState === 'connected' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              
              {/* Simulated Video Feeds */}
              <div style={{ height: 200, background: '#000', position: 'relative', overflow: 'hidden' }}>
                {/* Remote Video (Agent) */}
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                  {!camOff ? (
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <span style={{ fontSize: 44 }}>👩🏻‍💼</span>
                      <p style={{ fontSize: 12, marginTop: 8, color: '#aaa' }}>[ Priya is holding up Banarasi Silk Saree ]</p>
                    </div>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: 12 }}>Agent camera turned off</span>
                  )}
                </div>

                {/* Self View (Customer) */}
                <div style={{ position: 'absolute', bottom: 10, right: 10, width: 80, height: 110, borderRadius: 8, background: '#111', border: '1px solid #fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!micMuted ? <span style={{ fontSize: 24 }}>🧑🏻</span> : <span style={{ fontSize: 14, color: '#fff' }}>Muted</span>}
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, background: dark ? '#0d0d0f' : '#f8f8fa' }}>
                {chatMessages.map((m, idx) => (
                  <div key={idx} style={{ alignSelf: m.sender === 'agent' ? 'flex-start' : 'flex-end', background: m.sender === 'agent' ? (dark ? '#18181b' : '#eaeaea') : '#6366f1', color: m.sender === 'agent' ? c.text : '#fff', padding: '8px 12px', borderRadius: 12, maxWidth: '80%', fontSize: 13, lineHeight: 1.4 }}>
                    {m.text}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChat} style={{ borderTop: `1px solid ${c.border}`, display: 'flex', padding: 8, background: dark ? '#0f0f12' : '#ffffff' }}>
                <input 
                  placeholder="Type message..." 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{ flex: 1, background: 'none', border: 'none', color: c.text, padding: '8px 12px', fontSize: 13, outline: 'none' }} 
                />
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Send</button>
              </form>

              {/* Media Controls Bar */}
              <div style={{ padding: 12, background: dark ? '#141417' : '#f0f0f4', display: 'flex', justifyContent: 'center', gap: 16 }}>
                <button onClick={() => setMicMuted(!micMuted)} style={{ background: micMuted ? '#ef4444' : (dark ? '#1e1e24' : '#fff'), border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>
                  {micMuted ? '🎙️❌' : '🎙️'}
                </button>
                <button onClick={() => setCamOff(!camOff)} style={{ background: camOff ? '#ef4444' : (dark ? '#1e1e24' : '#fff'), border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>
                  {camOff ? '📷❌' : '📷'}
                </button>
                <button onClick={() => setWidgetState('closed')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0 16px', borderRadius: 20, height: 36, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  End Call
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Floating Button Keyframe animations helper */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media(max-width: 768px) {
          .demo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}
