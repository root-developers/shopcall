import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import LogoIcon from '../components/LogoIcon';

const FAQs = [
  { q: "How does the ShopCall video call button integrate with my website?", a: "You only need to add one line of JavaScript code right before the closing </body> tag of your site. It is fully compatible with Shopify, WooCommerce, Magento, and custom HTML/React websites." },
  { q: "Do my customers need to download an app or sign up to make a call?", a: "No. Customers do not need to download any apps, install plugins, or sign up for accounts. The call launches directly inside their mobile or desktop browser (Safari, Chrome, Firefox, etc.) instantly with a single click." },
  { q: "How does the sales agent receive and answer customer calls?", a: "Sales agents log in to the ShopCall web dashboard on their phone, tablet, or laptop. When a customer calls, agents receive real-time audio rings and browser push notifications to join the call instantly." },
  { q: "What happens if all my sales agents are offline or busy?", a: "If agents are offline or busy in calls, the floating widget automatically switches to a lead-capture callback form. Customers can leave their name and phone number, which are saved on your merchant dashboard for follow-ups." },
  { q: "What is a Video SDK and why does ShopCall use it?", a: "A Video SDK (Software Development Kit) is a set of pre-built code libraries and cloud infrastructure used to embed real-time video calling into apps. ShopCall utilizes VideoSDK.live to run ultra-low latency, secure, and encrypted video feeds directly in the customer browser." },
  { q: "Which Video SDK provides the best developer experience?", a: "VideoSDK.live offers the best experience for e-commerce developers. It provides ready-to-use React hooks, detailed vanilla JS scripts, highly optimized low-bandwidth WebRTC streams for 4G networks, and is significantly more affordable than older providers like Twilio or Agora." },
  { q: "What is the difference between Zoom Video SDK vs Meeting SDK and their pricing?", a: "The Zoom Meeting SDK embeds the pre-built Zoom interface (menus, grid, branding) into your app, while the Zoom Video SDK provides raw audio/video feeds for custom UI designs. However, Zoom video SDK pricing can get expensive with user-based commitments. ShopCall offers a streamlined, budget-friendly live video SDK specifically tailored for e-commerce stores." },
  { q: "How do I embed a live React video SDK into my online store?", a: "To integrate a video SDK, you can install the React video SDK package and wrap your views in a video provider. With ShopCall, you don't even need custom React boilerplate; you can embed the live video SDK by adding a single script tag to your online store, which immediately handles incoming shopper calls dynamically." },
  { q: "How do I implement a video sdk live session for product demonstrations?", a: "To host a video sdk live session, you need WebRTC servers and real-time signalling to connect agents and buyers. With ShopCall's fully optimized video sdk live infrastructure, you bypass weeks of server setup and coding. You simply embed our lightweight widget to activate instant 1-on-1 video sdk live streams right on your storefront." }
];

const DEFAULT_FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'One-line Integration',
    desc: 'No npm install. No build step. Just paste a script tag and you\'re live in under 2 minutes.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    title: 'HD Video Calls',
    desc: 'Optimised for mobile networks. Works flawlessly on 4G with adaptive WebRTC bitrate.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'In-call Checkout',
    desc: 'Share product links, apply coupons, and let customers complete purchase inside the video call.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Real-time Analytics',
    desc: 'Every call tracked. See caller location, durations, agent performance, and conversion rates.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Team Management',
    desc: 'Add multiple agents, set online status, and route incoming calls automatically to free seats.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Enterprise Security',
    desc: 'Fully encrypted streams. No call recording stored. Your proprietary customer data remains yours.'
  }
];

const DEFAULT_STEPS = [
  { title: 'Create account', desc: 'Sign up in 30 seconds. Get your store dashboard instantly.' },
  { title: 'Copy your snippet', desc: 'Copy the lightweight HTML embed script containing your key.' },
  { title: 'Paste before </body>', desc: 'Works with any platform — Shopify, WooCommerce, Webflow, Custom.' },
  { title: 'Go live', desc: 'Customers see a beautiful floating "Live Shop" button instantly.' },
];

const DEFAULT_CONTENT = {
  hero: { badge: 'Now in public beta', title: 'Turn your website into a', titleHighlight: 'live showroom', subtitle: 'One script tag adds a "Live Shop" button to your store. Customers click, you connect via video, show products, and close the deal — all without them leaving your site.', cta: 'Start free', ctaSecondary: 'Book Demo', note: 'Free forever for 5 calls · No credit card' },
  stats: [{ v: '46.2%', l: 'Market CAGR' }, { v: '10K+', l: 'Calls' }, { v: '3.2x', l: 'More conversions' }, { v: '<2min', l: 'Setup' }],
  platforms: ['Shopify', 'WooCommerce', 'Magento', 'Custom', 'Webflow', 'Wix'],
  features: DEFAULT_FEATURES,
  steps: DEFAULT_STEPS,
  pricing: [
    { name: 'Free', price: '₹0', sub: '5 calls included', features: ['1 agent seat', 'Call analytics', 'SDK integration', 'Community support'], popular: false },
    { name: 'Starter', price: '₹999', sub: 'per month', features: ['200 calls/mo', '3 agent seats', 'Priority support', 'Custom branding'], popular: true },
    { name: 'Pro', price: '₹2,999', sub: 'per month', features: ['Unlimited calls', '10 agent seats', 'Scheduling', 'API access', 'Dedicated CSM'], popular: false },
  ],
  finalCta: { title: 'Ready to go live?', subtitle: 'Position your brand at the forefront of India\'s live commerce boom. Setup takes less than 2 minutes.', button: 'Get your SDK key', note: 'No credit card · Free 5 calls · Cancel anytime' },
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
  scale: 100,
};

export default function Landing() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('site_content');
      return cached ? { ...DEFAULT_CONTENT, ...JSON.parse(cached) } : DEFAULT_CONTENT;
    } catch (e) {
      return DEFAULT_CONTENT;
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('site_content');
  });
  const [openFaq, setOpenFaq] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  // Pricing Yearly Toggle
  const [isAnnual, setIsAnnual] = useState(false);

  // Steps active tab state
  const [activeStep, setActiveStep] = useState(0);

  // Simulator States
  const [simState, setSimState] = useState('store'); // store, prompt, ring, connected
  const [simName, setSimName] = useState('');
  const [simPhone, setSimPhone] = useState('');
  const [simChat, setSimChat] = useState([
    { sender: 'agent', text: 'Namaste! Welcome to our boutique. Let me show you this Banarasi saree live.' }
  ]);
  const [simInput, setSimInput] = useState('');
  const [simMic, setSimMic] = useState(false);
  const [simCam, setSimCam] = useState(false);
  const [userStream, setUserStream] = useState(null);

  useEffect(() => { localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);
  
  useEffect(() => {
    document.title = 'ShopCall - Live Video Shopping for E-commerce | Add Live Shop Button';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Add a Live Shop video call button to your e-commerce store with 2 lines of code. Connect with customers via HD video, show products live, and close sales 3x faster.');
    
    fetch(`${API}/site`)
      .then(r => r.json())
      .then(d => {
        if (d && d.hero) {
          setContent({ ...DEFAULT_CONTENT, ...d });
          localStorage.setItem('site_content', JSON.stringify(d));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Dynamically inject JSON-LD FAQ schema for Search Engine rankings
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-jsonld';
    script.innerHTML = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById('faq-jsonld')?.remove();
    };
  }, []);

  // Web camera setup for high fidelity interactive widget demo
  useEffect(() => {
    if (simState === 'connected' && !simCam) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          setUserStream(stream);
        })
        .catch(err => {
          console.warn("Camera preview skipped:", err);
        });
    } else {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
        setUserStream(null);
      }
    }
    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [simState, simCam]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.lp-reveal,.lp-reveal-scale').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#09090b' }}>
        <LogoIcon size={56} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.08)}}`}</style>
      </div>
    );
  }

  const c = dark ? D : L;
  const { hero, stats, platforms, features, steps, pricing, finalCta, footer } = content;
  const scale = content.scale || 100;

  const getDisplayPrice = (priceStr) => {
    if (!isAnnual) return priceStr;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return priceStr;
    const discounted = Math.round(num * 0.8);
    return `₹${discounted.toLocaleString('en-IN')}`;
  };

  const handleSimStartCall = async (e) => {
    e.preventDefault();
    if (!simName || !simPhone) return;
    setSimState('ring');
    try {
      await fetch(`${API}/requests/tested-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: simName, phone: simPhone })
      });
    } catch (err) {
      console.error('Failed to save tested lead:', err);
    }
    setTimeout(() => {
      setSimState('connected');
    }, 2000);
  };

  const handleSimSendChat = (e) => {
    e.preventDefault();
    if (!simInput.trim()) return;
    setSimChat(prev => [...prev, { sender: 'customer', text: simInput }]);
    const val = simInput;
    setSimInput('');
    setTimeout(() => {
      let reply = "Here is the fabric detail. I am matching a contrast blouse as well.";
      if (val.toLowerCase().includes('price') || val.toLowerCase().includes('cost')) {
        reply = "This pure silk saree is ₹14,999. I can apply a live promo code code: SC10 for you!";
      } else if (val.toLowerCase().includes('color') || val.toLowerCase().includes('other')) {
        reply = "Yes, we also have this in royal blue and mustard yellow. Let me show you.";
      }
      setSimChat(prev => [...prev, { sender: 'agent', text: reply }]);
    }, 1200);
  };

  // Splitting FAQs array into two halves for parallel desktop view
  const half = Math.ceil(FAQs.length / 2);
  const leftFAQs = FAQs.slice(0, half);
  const rightFAQs = FAQs.slice(half);

  return (
    <div role="main" style={{ background: c.bg, color: c.text, transition: 'all 0.4s ease', minHeight: '100vh', zoom: scale / 100, position: 'relative' }} className="lp-section-grid">
      <div className="blob-container">
        <div className="blob-indigo" />
        <div className="blob-purple" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}
        .lp-section-grid {
          position: relative;
        }
        .lp-section-grid::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(${dark ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.015)'} 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 1;
        }
        .blob-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .blob-indigo {
          position: absolute;
          top: -150px;
          left: 15%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.01) 75%);
          filter: blur(90px);
          animation: blob-float 15s infinite alternate ease-in-out;
        }
        .blob-purple {
          position: absolute;
          top: 600px;
          right: 5%;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, rgba(236,72,153,0.01) 75%);
          filter: blur(100px);
          animation: blob-float-reverse 20s infinite alternate ease-in-out;
        }
        @keyframes blob-float {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(50px, 40px) scale(1.1); }
        }
        @keyframes blob-float-reverse {
          0% { transform: translate(0,0) scale(1.1); }
          100% { transform: translate(-50px, -40px) scale(0.9); }
        }
        .lp-enter{animation:lpEnter .7s cubic-bezier(.16,1,.3,1) both}
        .lp-enter-d1{animation-delay:.1s}
        .lp-enter-d2{animation-delay:.2s}
        .lp-enter-d3{animation-delay:.3s}
        @keyframes lpEnter{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .lp-reveal{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .lp-reveal.visible{opacity:1;transform:translateY(0)}
        .lp-reveal-d1{transition-delay:.1s}
        .lp-reveal-d2{transition-delay:.2s}
        .lp-reveal-d3{transition-delay:.3s}
        .lp-reveal-scale{opacity:0;transform:scale(.94);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
        .lp-reveal-scale.visible{opacity:1;transform:scale(1)}
        
        /* Modern Glass Cards */
        .lp-card {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all .35s cubic-bezier(.16,1,.3,1);
          border: 1px solid ${c.border};
        }
        .lp-card:hover {
          transform: translateY(-6px);
          background: ${dark ? 'rgba(24, 24, 27, 0.8)' : 'rgba(255, 255, 255, 0.95)'} !important;
          border-color: #6366f1 !important;
          box-shadow: 0 20px 40px -15px ${dark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)'};
        }
        .lp-cta{transition:all .25s cubic-bezier(.16,1,.3,1);box-shadow:0 8px 24px rgba(99,102,241,0.2)}
        .lp-cta:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(99,102,241,0.4);filter:brightness(1.05)}
        .lp-cta:active{transform:translateY(0)}
        .lp-cta-ghost{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .lp-cta-ghost:hover{background:${dark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.04)'} !important;border-color:#6366f1 !important;transform:translateY(-2px)}
        .lp-theme{transition:transform .3s cubic-bezier(.16,1,.3,1)}
        .lp-theme:hover{transform:scale(1.08) rotate(8deg)}
        .lp-theme:active{transform:scale(.95)}
        .lp-gradient-text{background:linear-gradient(135deg,#6366f1 20%,#a78bfa 50%,#f472b6 80%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:lpGradient 5s linear infinite}
        @keyframes lpGradient{0%{background-position:0% center}50%{background-position:100% center}100%{background-position:0% center}}
        .lp-shimmer{position:relative;overflow:hidden}
        .lp-shimmer::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,${dark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.02)'},transparent);animation:lpShimmer 3.5s infinite}
        @keyframes lpShimmer{to{left:100%}}
        .lp-nav-link{position:relative}
        .lp-nav-link::after{content:'';position:absolute;bottom:-4px;left:50%;width:0;height:2px;background:#6366f1;border-radius:1px;transition:width .3s,left .3s}
        .lp-nav-link:hover::after{width:100%;left:0}
        .lp-nav-link:hover{color:${dark ? '#f4f4f5' : '#18181b'} !important}
        .lp-step-line{background:linear-gradient(180deg,#6366f1,${dark ? '#1f1f23' : '#e4e4e7'});transition:background .3s}
        
        .ringing-wave {
          position: absolute;
          inset: 0;
          border: 2px solid #6366f1;
          border-radius: 50%;
          animation: phoneRing 1.8s ease-out infinite;
          opacity: 0;
        }
        @keyframes phoneRing {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .lp-hamburger{display:none;background:none;border:none;cursor:pointer;padding:6px;color:inherit}
        .lp-mobile-nav{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:200}
        .lp-mobile-nav-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}
        .lp-mobile-nav-panel{position:absolute;top:0;right:0;width:280px;height:100%;padding:24px;display:flex;flex-direction:column;gap:8px;animation:lpSlideIn .25s ease}
        @keyframes lpSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        
        /* Layout Grids */
        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: center;
        }

        /* Parallel Columns FAQ */
        .lp-faq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Step Section Interactive Split */
        .lp-step-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        @media(max-width:960px){
          .lp-hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
            gap: 48px;
          }
          .lp-hero-text-align {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .lp-grid3{grid-template-columns:1fr 1fr !important}
          .lp-hide-md{display:none !important}
          .lp-hamburger{display:flex !important}
          .lp-mobile-nav.open{display:block !important}
          .lp-footer-grid{grid-template-columns:1fr 1fr 1fr !important;gap:32px !important}
        }
        @media(max-width:768px){
          .lp-faq-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .lp-step-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: center;
          }
          .lp-step-visual {
            justify-content: center !important;
          }
        }
        @media(max-width:600px){
          .lp-grid3{grid-template-columns:1fr !important}
          .lp-grid4{grid-template-columns:1fr 1fr !important;gap:20px !important}
          .lp-hero-h{font-size:38px !important;line-height:1.15 !important}
          .lp-hero-p{font-size:16px !important}
          .lp-section{padding:48px 16px 24px !important}
          .lp-section h2 { font-size: 28px !important; line-height: 1.25 !important; letter-spacing: -0.6px !important; }
          .lp-cta-row{flex-direction:column;width:100%;align-items:stretch}
          .lp-cta-row>*{text-align:center;justify-content:center}
          .lp-footer-grid{grid-template-columns:1fr 1fr !important;gap:24px !important}
          .lp-stats{gap:24px !important}
        }
        .lp-dash-layout {
          display: grid;
          grid-template-columns: 170px 1fr;
        }
        @media (max-width: 768px) {
          .lp-dash-layout {
            grid-template-columns: 1fr !important;
          }
          .lp-dash-sidebar {
            display: none !important;
          }
        }
        .lp-dash-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 840px) {
          .lp-dash-metrics {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .lp-dash-metrics {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes streamPulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.9; }
          100% { opacity: 0.4; }
        }
        @keyframes floatingBadge {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }
        .lp-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 12px;
          border: 1px solid ${c.border};
          background: ${dark ? '#0c0c0e' : '#f9f9fb'};
          color: ${c.text};
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.25s ease;
        }
        .lp-input:focus {
          border-color: #6366f1;
          background: ${dark ? '#0f0f13' : '#ffffff'};
          box-shadow: 0 0 0 3px ${dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'};
        }
        .lp-input-group {
          position: relative;
          margin-bottom: 16px;
          width: 100%;
        }
        .lp-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: ${c.muted};
          pointer-events: none;
          transition: color 0.25s ease;
        }
        .lp-input:focus + .lp-input-icon {
          color: #6366f1;
        }
        .lp-modal-close:hover {
          transform: scale(1.08) rotate(90deg);
          border-color: #6366f1 !important;
          color: #6366f1 !important;
          background: ${dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)'} !important;
        }
        .lp-sim-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 2px ${dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)'} !important;
        }
        .lp-form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          width: 100%;
        }
        @media(max-width:480px){
          .lp-form-row {
            flex-direction: column;
            gap: 16px;
          }
        }
        .lp-platform-badges-wrap {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          width: 100%;
          max-width: 800px;
          padding: 0 16px;
        }
        @media(max-width: 600px){
          .lp-platform-badges-wrap {
            gap: 10px !important;
          }
          .lp-platform-title {
            font-size: 11px !important;
            letter-spacing: 0.8px !important;
            text-align: center;
            padding: 0 12px;
          }
          .lp-platform-badge {
            padding: 8px 14px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: dark ? 'rgba(9,9,11,.75)' : 'rgba(255,255,255,.8)', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoIcon size={34} />
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.4 }}>ShopCall</span>
          </div>

          <div className="lp-hide-md" style={{ display: 'flex', gap: 32 }}>
            {['Features','How it works','Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} className="lp-nav-link" style={{ color: c.muted, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'color .2s' }}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setDark(!dark)} className="lp-theme" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${c.border}`, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: c.text }} title="Toggle Theme">{dark ? '☀️' : '🌙'}</button>
            <button onClick={() => setShowDemo(true)} className="lp-cta-ghost lp-hide-md" style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.text, padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Book Demo</button>
            <Link to="/login" className="lp-hide-md" style={{ color: c.muted, fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '10px 14px' }}>Log in</Link>
            <Link to="/signup" className="lp-cta lp-hide-md" style={{ background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Get Started</Link>
            <button onClick={() => setMobileMenu(true)} className="lp-hamburger" aria-label="Open menu" style={{ color: c.text }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className={`lp-mobile-nav${mobileMenu ? ' open' : ''}`}>
        <div className="lp-mobile-nav-overlay" onClick={() => setMobileMenu(false)} />
        <div className="lp-mobile-nav-panel" style={{ background: dark ? '#111113' : '#fff' }}>
          <button onClick={() => setMobileMenu(false)} aria-label="Close menu" style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: c.text }}>×</button>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Features','How it works','Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={() => setMobileMenu(false)} style={{ color: c.text, fontSize: 16, fontWeight: 600, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>{l}</a>
            ))}
            <Link to="/login" onClick={() => setMobileMenu(false)} style={{ color: c.muted, fontSize: 16, fontWeight: 600, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>Log in</Link>
            <button onClick={() => { setMobileMenu(false); setShowDemo(true); }} style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.text, padding: '12px 20px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', textAlign: 'center', marginTop: 12 }}>Book Demo</button>
            <Link to="/signup" onClick={() => setMobileMenu(false)} style={{ background: '#6366f1', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', textAlign: 'center', marginTop: 8 }}>Get Started</Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="lp-section" style={{ padding: '80px 24px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div className="lp-hero-grid">
          
          {/* Hero Left: Text Column */}
          <div className="lp-hero-text-align" style={{ textAlign: 'left' }}>
            <div className="lp-enter lp-badge-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(99,102,241,0.08)' : '#eef2ff', border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'}`, borderRadius: 24, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', letterSpacing: 0.5 }}>{hero.badge}</span>
            </div>

            <h1 className="lp-enter lp-enter-d1 lp-hero-h" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.2, marginBottom: 20 }}>
              {hero.title}{' '}<span className="lp-gradient-text">{hero.titleHighlight}</span>
            </h1>

            <p className="lp-enter lp-enter-d2 lp-hero-p" style={{ fontSize: 18, color: c.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 540 }}>
              {hero.subtitle}
            </p>

            <div className="lp-enter lp-enter-d3 lp-cta-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/signup" className="lp-cta" style={{ background: '#6366f1', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                {hero.cta} <span style={{ fontSize: 18 }}>→</span>
              </Link>
              <button onClick={() => setSimState('prompt')} className="lp-cta-ghost" style={{ padding: '14px 24px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: `1px solid #6366f1`, color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)', cursor: 'pointer', justifyContent: 'center' }}>
                <svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Test Live Widget
              </button>
            </div>

            <p className="lp-enter lp-enter-d3" style={{ fontSize: 13, color: c.muted, marginTop: 16 }}>{hero.note}</p>
          
            {/* Social proof strip inside left column */}
            <div className="lp-enter lp-enter-d3 lp-stats" style={{ display: 'flex', gap: 36, marginTop: 44, borderTop: `1px solid ${c.border}`, paddingTop: 28, flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.l}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: c.text }}>{s.v}</p>
                  <p style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right: Interactive Mobile Mockup */}
          <div className="lp-enter lp-enter-d2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15%', left: '5%', width: 140, padding: 12, background: dark ? 'rgba(17, 17, 19, 0.8)' : 'rgba(255,255,255,0.9)', border: `1px solid ${c.border}`, borderRadius: 12, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center', backdropFilter: 'blur(8px)', zIndex: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }} className="lp-hide-md">
              <span style={{ background: '#22c55e', width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }} />
              <span>Agent Online (Priya)</span>
            </div>
            
            <div style={{ position: 'absolute', bottom: '15%', right: '0%', width: 150, padding: 12, background: dark ? 'rgba(17, 17, 19, 0.8)' : 'rgba(255,255,255,0.9)', border: `1px solid ${c.border}`, borderRadius: 12, fontSize: 12, display: 'flex', gap: 8, flexDirection: 'column', backdropFilter: 'blur(8px)', zIndex: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }} className="lp-hide-md">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: c.muted }}><span>Conversion Status</span><span style={{ color: '#22c55e' }}>+320%</span></div>
              <div style={{ background: '#6366f1', height: 4, borderRadius: 2, width: '85%' }} />
            </div>

            {/* Smartphone Container */}
            <div style={{
              width: '100%',
              maxWidth: 290,
              height: 500,
              background: dark ? '#0c0c0e' : '#ffffff',
              borderRadius: 36,
              border: `9px solid ${dark ? '#1f1f23' : '#18181b'}`,
              boxShadow: dark ? '0 30px 60px -15px rgba(99,102,241,0.2)' : '0 30px 60px -15px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Inter, sans-serif'
            }}>
              {/* Notch */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 110,
                height: 18,
                background: dark ? '#1f1f23' : '#18181b',
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
                zIndex: 30
              }} />

              {/* State 1: Store Catalog Screen */}
              {simState === 'store' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', padding: '24px 14px 14px' }}>
                  <div style={{ borderBottom: `1px solid ${c.border}`, paddingBottom: 8, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>AURA BOUTIQUE</span>
                    <span style={{ fontSize: 9, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 5px', borderRadius: 4 }}>Live Shop</span>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 2 }}>
                    <div style={{ background: dark ? '#161619' : '#f4f4f7', borderRadius: 12, padding: 8, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 2 }}>🌸</div>
                      <h4 style={{ fontSize: 11, fontWeight: 700 }}>Banarasi Silk Saree</h4>
                      <p style={{ fontSize: 9, color: c.muted, marginTop: 1 }}>Pure handloom zari border</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>₹14,999</span>
                        <button style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 6px', fontSize: 9, fontWeight: 700 }}>Add</button>
                      </div>
                    </div>

                    <div style={{ background: dark ? '#161619' : '#f4f4f7', borderRadius: 12, padding: 8, border: `1px solid ${c.border}`, opacity: 0.85 }}>
                      <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 2 }}>💎</div>
                      <h4 style={{ fontSize: 11, fontWeight: 700 }}>Antique Gold Choker</h4>
                      <p style={{ fontSize: 9, color: c.muted, marginTop: 1 }}>Kundan stone necklace set</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>₹48,500</span>
                        <span style={{ fontSize: 9, color: c.muted }}>In stock</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Pointer Tooltip pointing directly to the button */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 52, 
                    right: 14, 
                    background: '#6366f1', 
                    color: '#fff', 
                    borderRadius: 8, 
                    padding: '5px 10px', 
                    fontSize: 9, 
                    fontWeight: 700, 
                    boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                    zIndex: 25,
                    animation: 'floatingBadge 2s ease-in-out infinite'
                  }}>
                    👉 Click "Live Shop" below!
                    <div style={{
                      position: 'absolute',
                      bottom: -3,
                      right: 32,
                      width: 6,
                      height: 6,
                      background: '#6366f1',
                      transform: 'rotate(45deg)'
                    }} />
                  </div>

                  {/* Floating Live Shop Widget inside Phone Mock */}
                  <button 
                    onClick={() => setSimState('prompt')}
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      right: 14,
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      animation: 'pulse 1.8s ease-in-out infinite',
                      zIndex: 20
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> Live Shop
                  </button>
                </div>
              )}

              {/* State 2: Prompt Form */}
              {simState === 'prompt' && (
                <form onSubmit={handleSimStartCall} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 16px 16px', gap: 10, justifyContent: 'center' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, textAlign: 'center' }}>Connect to Showroom</h3>
                  <p style={{ fontSize: 10, color: c.muted, textAlign: 'center', lineHeight: 1.4 }}>Start a simulated video call to inspect saree fabrics live.</p>
                  
                  <input 
                    required 
                    placeholder="Your Name" 
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#161619' : '#fafafa', color: c.text, fontSize: 11, outline: 'none', transition: 'all 0.2s' }} 
                    className="lp-sim-input"
                  />
                  <input 
                    required 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={simPhone}
                    onChange={e => setSimPhone(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${c.border}`, background: dark ? '#161619' : '#fafafa', color: c.text, fontSize: 11, outline: 'none', transition: 'all 0.2s' }} 
                    className="lp-sim-input"
                  />

                  <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 2 }}>Call Showroom</button>
                  <button type="button" onClick={() => setSimState('store')} style={{ background: 'none', border: 'none', color: c.muted, fontSize: 10, cursor: 'pointer' }}>Cancel</button>
                </form>
              )}

              {/* State 3: Ringing screen */}
              {simState === 'ring' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative' }}>
                    <div className="ringing-wave" style={{ animationDelay: '0s' }} />
                    <div className="ringing-wave" style={{ animationDelay: '0.6s' }} />
                    🔔
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700 }}>Calling showroom...</p>
                  <p style={{ fontSize: 9, color: c.muted, textAlign: 'center', padding: '0 8px' }}>Connecting to our active boutique agent floor.</p>
                </div>
              )}

              {/* State 4: Connected Call Interface */}
              {simState === 'connected' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden' }}>
                  {/* Remote Showroom Feed */}
                  <div style={{ height: 140, background: '#18181b', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Simulated Showroom Video Backdrop */}
                    <div style={{ position: 'absolute', inset: 0, background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center', zIndex: 2 }}>
                        <span style={{ fontSize: 24 }}>👚</span>
                        <p style={{ fontSize: 8, color: '#fff', marginTop: 2, fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '1px 4px', borderRadius: 4 }}>Showing: Banarasi Zari</p>
                      </div>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'linear-gradient(45deg, #6366f1, #ec4899)' }} />
                    </div>

                    {/* Local Feed Overlay */}
                    <div style={{ position: 'absolute', bottom: 6, right: 6, width: 44, height: 64, borderRadius: 6, background: '#09090b', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                      {userStream ? (
                        <video 
                          ref={el => { if (el) el.srcObject = userStream; }} 
                          autoPlay 
                          playsInline 
                          muted 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>👤</div>
                      )}
                    </div>

                    {/* Call Status badges */}
                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4 }}>
                      <span style={{ fontSize: 7, background: '#ef4444', color: '#fff', padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>LIVE</span>
                      <span style={{ fontSize: 7, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '1px 4px', borderRadius: 4 }}>0:45</span>
                    </div>
                  </div>

                  {/* Chat / Call Details Area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: dark ? '#0f0f12' : '#f9f9fb', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: 8, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {simChat.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: m.sender === 'customer' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '85%',
                            padding: '5px 8px',
                            borderRadius: 10,
                            fontSize: 9,
                            lineHeight: 1.3,
                            background: m.sender === 'customer' ? '#6366f1' : (dark ? '#1c1c21' : '#ffffff'),
                            color: m.sender === 'customer' ? '#fff' : c.text,
                            border: m.sender === 'customer' ? 'none' : `1px solid ${c.border}`
                          }}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Suggestions */}
                    <div style={{ display: 'flex', gap: 3, padding: '3px 6px', overflowX: 'auto', borderTop: `1px solid ${c.border}` }}>
                      {['What is the price?', 'Different colors?', 'Shipping?'].map(s => (
                        <button key={s} type="button" onClick={() => { setSimInput(s); }} style={{ whiteSpace: 'nowrap', fontSize: 8, background: dark ? '#18181b' : '#eaeaea', border: `1px solid ${c.border}`, color: c.text, padding: '3px 6px', borderRadius: 8, cursor: 'pointer' }}>{s}</button>
                      ))}
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSimSendChat} style={{ display: 'flex', borderTop: `1px solid ${c.border}`, padding: 4, background: dark ? '#0c0c0e' : '#fff' }}>
                      <input 
                        value={simInput}
                        onChange={e => setSimInput(e.target.value)}
                        placeholder="Ask a question..." 
                        style={{ flex: 1, border: 'none', background: 'none', color: c.text, fontSize: 10, outline: 'none', paddingLeft: 4 }} 
                      />
                      <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', width: 18, height: 18, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, cursor: 'pointer' }}>➔</button>
                    </form>

                    {/* Controls Footer */}
                    <div style={{ background: dark ? '#09090b' : '#f0f0f4', borderTop: `1px solid ${c.border}`, padding: 6, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                      <button type="button" onClick={() => setSimMic(!simMic)} style={{ background: 'none', border: 'none', fontSize: 11, cursor: 'pointer' }}>{simMic ? '🔇' : '🎙️'}</button>
                      <button type="button" onClick={() => setSimCam(!simCam)} style={{ background: 'none', border: 'none', fontSize: 11, cursor: 'pointer' }}>{simCam ? '❌📹' : '📹'}</button>
                      <button type="button" onClick={() => { setSimState('store'); setSimChat([{ sender: 'agent', text: 'Namaste! Welcome to our boutique. Let me show you this Banarasi saree live.' }]); }} style={{ background: '#ef4444', border: 'none', borderRadius: 8, padding: '3px 10px', fontSize: 8, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Disconnect</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Platform logos carousel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80, paddingTop: 40, width: '100%', overflow: 'hidden' }} className="lp-reveal">
          <p className="lp-platform-title" style={{ fontSize: 13, color: c.muted, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>Integrates instantly with your entire stack</p>
          <div className="lp-platform-badges-wrap">
            {[
              { name: 'Shopify', color: '#96bf48', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#96bf48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
              { name: 'WooCommerce', color: '#96588a', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#96588a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
              { name: 'Magento', color: '#f26322', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f26322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 7.5 22 18.5 12 24 2 18.5 2 7.5 12 2"/><polyline points="12 22 12 2"/></svg> },
              { name: 'Wix', color: dark ? '#ffffff' : '#000000', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={dark ? '#ffffff' : '#000000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              { name: 'Webflow', color: '#4353ff', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4353ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 12H3"/><path d="M12 3v18"/></svg> },
              { name: 'Custom / React', color: '#61dafb', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="1.8"><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"/><circle cx="12" cy="12" r="1.5" fill="#61dafb"/></svg> }
            ].map(p => (
              <div key={p.name} style={{ 
                padding: '10px 20px', 
                borderRadius: 12, 
                border: `1px solid ${c.border}`, 
                fontSize: 14, 
                color: c.text, 
                fontWeight: 700, 
                background: c.card, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                transition: 'all 0.3s ease'
              }} className="lp-platform-badge">
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span>{p.name}</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, marginLeft: 4 }} />
              </div>
            ))}
          </div>
          <style>{`
            .lp-platform-badge:hover {
              border-color: #6366f1 !important;
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(99,102,241,0.06);
            }
          `}</style>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="lp-section" style={{ padding: '80px 24px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', textAlign: 'center' }}>
          <p className="lp-reveal" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Dashboard Analytics</p>
          <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.8, marginBottom: 40 }}>Full dashboard control</h2>
          {/* Responsive HTML/CSS Interactive Dashboard Mockup */}
          <div className="lp-reveal-scale lp-reveal-d2 lp-card" style={{ 
            borderRadius: 20, 
            overflow: 'hidden', 
            background: dark ? '#0d0d0f' : '#ffffff', 
            border: `1px solid ${c.border}`,
            boxShadow: dark ? '0 30px 60px -15px rgba(0,0,0,0.6)' : '0 30px 60px -15px rgba(99,102,241,0.08)',
            textAlign: 'left'
          }}>
            {/* Browser Header Bar */}
            <div style={{ 
              background: dark ? '#16161a' : '#f0f0f4', 
              padding: '12px 18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              borderBottom: `1px solid ${c.border}`
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57','#febc2e','#28c840'].map(cc => <div key={cc} style={{ width: 10, height: 10, borderRadius: '50%', background: cc }} />)}
              </div>
              <div style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingRight: 60
              }}>
                <span style={{ 
                  fontSize: 11, 
                  color: c.muted, 
                  fontFamily: 'monospace', 
                  background: dark ? '#0c0c0e' : '#fff',
                  padding: '4px 24px',
                  borderRadius: 6,
                  border: `1px solid ${c.border}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  🔒 shopcall.store/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard Inner Layout */}
            <div className="lp-dash-layout" style={{ minHeight: 380 }}>
              {/* Sidebar */}
              <div className="lp-dash-sidebar" style={{ 
                borderRight: `1px solid ${c.border}`, 
                padding: 16, 
                background: dark ? '#0a0a0c' : '#f9f9fb',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff' }}>S</div>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>ShopCall</span>
                </div>
                {[
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, label: 'Overview', active: true },
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, label: 'Call Log' },
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Live Agents' },
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'Leads' },
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, label: 'Settings' }
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: item.active ? 'rgba(99,102,241,0.08)' : 'transparent',
                    color: item.active ? '#6366f1' : c.muted,
                    border: item.active ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflowX: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>Aura Boutique Live Overview</h3>
                    <p style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>Real-time showroom analytics</p>
                  </div>
                  <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>● Showroom Active</span>
                </div>

                {/* Metrics Grid */}
                <div className="lp-dash-metrics">
                  {[
                    { label: 'Total Calls', val: '1,280', change: '+12% vs last week', up: true },
                    { label: 'Conversion Rate', val: '18.4%', change: '3.2x higher 🚀', up: true, highlight: true },
                    { label: 'Sales Closed', val: '₹45,800', change: "Today's live deals", up: true },
                    { label: 'Avg Call Time', val: '4m 12s', change: 'Optimal engagement', up: false }
                  ].map(m => (
                    <div key={m.label} style={{ 
                      background: m.highlight ? (dark ? 'rgba(99,102,241,0.06)' : '#f5f3ff') : (dark ? '#111113' : '#fafafa'), 
                      border: m.highlight ? '1px solid #6366f1' : `1px solid ${c.border}`, 
                      borderRadius: 12, 
                      padding: 12,
                      boxShadow: m.highlight ? (dark ? '0 4px 20px rgba(99,102,241,0.15)' : '0 4px 20px rgba(99,102,241,0.05)') : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <span style={{ fontSize: 10, color: m.highlight ? '#6366f1' : c.muted, fontWeight: m.highlight ? 700 : 500 }}>{m.label}</span>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 2px', color: m.highlight ? (dark ? '#fff' : '#4f46e5') : c.text }}>{m.val}</h4>
                      <span style={{ fontSize: 8, color: m.highlight ? '#6366f1' : (m.up ? '#22c55e' : c.muted), fontWeight: 700 }}>{m.change}</span>
                    </div>
                  ))}
                </div>

                {/* Call Feed Mock Table */}
                <div style={{ flex: 1, minHeight: 120 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: c.muted }}>Live Calling Activity</p>
                  <div style={{ overflowX: 'auto', border: `1px solid ${c.border}`, borderRadius: 10 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: dark ? '#111113' : '#fafafa', borderBottom: `1px solid ${c.border}` }}>
                          <th style={{ padding: '6px 8px', fontWeight: 700 }}>ID</th>
                          <th style={{ padding: '6px 8px', fontWeight: 700 }}>Agent</th>
                          <th style={{ padding: '6px 8px', fontWeight: 700 }}>Customer</th>
                          <th style={{ padding: '6px 8px', fontWeight: 700 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>SC-302</td>
                          <td style={{ padding: '6px 8px' }}>Priya (Boutique Floor)</td>
                          <td style={{ padding: '6px 8px' }}>Ananya S.</td>
                          <td style={{ padding: '6px 8px', color: '#22c55e', fontWeight: 700 }}>
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 6, verticalAlign: 'middle', animation: 'streamPulse 1s infinite' }} />
                            Active Call 📹
                          </td>
                        </tr>
                        <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>SC-301</td>
                          <td style={{ padding: '6px 8px' }}>Rohan (Tech Hub)</td>
                          <td style={{ padding: '6px 8px' }}>Vikram M.</td>
                          <td style={{ padding: '6px 8px', color: '#6366f1', fontWeight: 700 }}>Callback Scheduled</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>SC-300</td>
                          <td style={{ padding: '6px 8px' }}>Priya (Boutique Floor)</td>
                          <td style={{ padding: '6px 8px' }}>Neha R.</td>
                          <td style={{ padding: '6px 8px', color: '#22c55e', fontWeight: 700 }}>Sale Completed 💳</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-section" style={{ padding: '80px 24px 40px', background: dark ? 'rgba(12,12,14,0.6)' : '#fafbfc', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p className="lp-reveal" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Powerful Capabilities</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.8 }}>Built for conversions, not just conversations</h2>
          </div>
          <div className="lp-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {features.map((f, i) => (
              <div key={f.title} className={`lp-card lp-reveal lp-shimmer lp-reveal-d${Math.min(i + 1, 5)}`} style={{ background: c.card, borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20, color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.6, flex: 1 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="lp-section" style={{ padding: '80px 24px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p className="lp-reveal" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Trusted by E-commerce Leaders</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.8 }}>Grow your brand in India's fastest-growing live retail market</h2>
          </div>
          <div className="lp-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              {
                quote: "ShopCall has completely transformed our online shopping experience. Showing our Banarasi sarees live to NRI buyers boosted our sales by 280% within the first month. Our buyers love the one-click instant call!",
                author: "Anjana Singh",
                role: "Founder, Aura Boutique (Varanasi)",
                metric: "+280% Sales Growth",
                avatar: "AS",
                color: "linear-gradient(135deg, #6366f1, #a78bfa)"
              },
              {
                quote: "We sell high-ticket diamond jewellery, and trust is everything. ShopCall lets us give virtual showroom walk-throughs in HD. Our conversion rates are up 4.2x, and customers feel secure making payments inside the call.",
                author: "Rajesh Mehta",
                role: "Director, Vedic Jewellers (Mumbai)",
                metric: "4.2x Conversions",
                avatar: "RM",
                color: "linear-gradient(135deg, #ec4899, #f472b6)"
              },
              {
                quote: "For Gen-Z fashion, speed is critical. Customers call to see the actual color and drape of outfits, and we close sales instantly. Our average order value rose by 195% since we added the Live Shop widget.",
                author: "Kritika Sen",
                role: "Co-Founder, Trendz Gen-Z (Bangalore)",
                metric: "+195% Avg Order Value",
                avatar: "KS",
                color: "linear-gradient(135deg, #10b981, #34d399)"
              }
            ].map((t, idx) => (
              <div key={t.author} className={`lp-card lp-reveal lp-reveal-d${idx + 1}`} style={{ background: c.card, borderRadius: 20, padding: 32, border: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: '#fbbf24', fontSize: 16 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: c.text, lineHeight: 1.6, fontStyle: 'italic', flex: 1, marginBottom: 24 }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${c.border}`, paddingTop: 20, marginTop: 'auto' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>{t.avatar}</div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{t.author}</h4>
                    <p style={{ fontSize: 12, color: c.muted }}>{t.role}</p>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 20, right: 20, background: dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)', color: '#6366f1', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800 }}>
                  {t.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (REWORKED INTERACTIVE STEP TIMELINE) */}
      <section id="how-it-works" className="lp-section" style={{ padding: '80px 24px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="lp-reveal" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Simple Integration</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.8 }}>Go live in 4 simple steps</h2>
          </div>

          {/* Timeline navigation bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: 48, padding: '0 24px' }} className="lp-reveal">
            {/* Dark/Light line background */}
            <div style={{ position: 'absolute', top: '22px', left: 48, right: 48, height: 4, background: dark ? '#1f1f23' : '#e4e4e7', zIndex: 1 }} />
            {/* Indigo active progress line */}
            <div style={{ position: 'absolute', top: '22px', left: 48, width: `${(activeStep / (steps.length - 1)) * 100}%`, height: 4, background: '#6366f1', zIndex: 2, transition: 'width 0.4s ease-out' }} />

            {steps.map((step, i) => {
              const isPassed = i <= activeStep;
              const isCurrent = i === activeStep;
              return (
                <button 
                  key={i} 
                  onClick={() => setActiveStep(i)}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: isCurrent ? '#6366f1' : (isPassed ? '#4f46e5' : (dark ? '#111113' : '#fff')),
                    color: isPassed || isCurrent ? '#fff' : c.muted,
                    border: `2px solid ${isCurrent || isPassed ? '#6366f1' : c.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isCurrent ? '0 0 16px rgba(99,102,241,0.5)' : 'none',
                    outline: 'none'
                  }}
                  title={step.title}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Active step contents box */}
          <div className="lp-card lp-reveal-scale" style={{ background: c.card, borderRadius: 24, padding: '36px', boxShadow: dark ? '0 20px 48px rgba(0,0,0,0.2)' : '0 20px 48px rgba(0,0,0,0.04)', border: `1px solid ${c.border}` }}>
            <div className="lp-step-grid">
              {/* Left Column - text info */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5 }}>Step {activeStep + 1} of 4</span>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 10, marginBottom: 12, letterSpacing: -0.5 }}>{steps[activeStep]?.title}</h3>
                <p style={{ fontSize: 16, color: c.muted, lineHeight: 1.6, marginBottom: 28 }}>{steps[activeStep]?.desc}</p>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(p => p - 1)}
                    style={{ background: 'transparent', border: `1px solid ${c.border}`, color: activeStep === 0 ? c.muted : c.text, padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: activeStep === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => {
                      if (activeStep < steps.length - 1) setActiveStep(p => p + 1);
                      else setActiveStep(0);
                    }}
                    style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {activeStep === steps.length - 1 ? 'Start Over' : 'Next Step'}
                  </button>
                </div>
              </div>

              {/* Right Column - Visual Live Simulator Mock */}
              <div style={{ display: 'flex', justifyContent: 'center', height: '100%', minHeight: 180 }} className="lp-step-visual">
                {activeStep === 0 && (
                  <div style={{ width: '100%', maxWidth: 260, padding: 18, background: dark ? '#161619' : '#f0f0f4', border: `1px solid ${c.border}`, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'center' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 800 }}>Create Store Dashboard</h4>
                    <div style={{ background: dark ? '#27272a' : '#fff', height: 26, borderRadius: 6, border: `1px solid ${c.border}` }} />
                    <div style={{ background: dark ? '#27272a' : '#fff', height: 26, borderRadius: 6, border: `1px solid ${c.border}` }} />
                    <div style={{ background: '#6366f1', height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>Create Store 🚀</div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div style={{ width: '100%', maxWidth: 280, background: '#09090b', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.06)', position: 'relative', alignSelf: 'center' }}>
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 8, background: 'rgba(255,255,255,0.1)', color: '#ccc', padding: '1px 5px', borderRadius: 4 }}>embed-code</span>
                    <pre style={{ fontSize: 9, color: '#a1a1aa', fontFamily: 'monospace', margin: 0, overflowX: 'auto', lineHeight: 1.4 }}>
                      <span style={{ color: '#6366f1' }}>&lt;script</span> src=<span style={{ color: '#fbbf24' }}>"..."</span><br/>
                      &nbsp;&nbsp;data-store=<span style={{ color: '#fbbf24' }}>"sc_key"</span><span style={{ color: '#6366f1' }}>&gt;</span>&lt;/script&gt;
                    </pre>
                    <button type="button" onClick={(e) => { e.target.innerText = 'Copied! ✓'; setTimeout(() => e.target.innerText = 'Copy script', 2000); }} style={{ marginTop: 10, width: '100%', background: '#1c1c21', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, padding: '5px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Copy script</button>
                  </div>
                )}
                {activeStep === 2 && (
                  <div style={{ width: '100%', maxWidth: 260, background: dark ? '#161619' : '#f0f0f4', border: `1px solid ${c.border}`, borderRadius: 16, padding: 14, alignSelf: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {['#ff5f57','#febc2e','#28c840'].map(cc => <div key={cc} style={{ width: 6, height: 6, borderRadius: '50%', background: cc }} />)}
                    </div>
                    <pre style={{ fontSize: 9, color: c.muted, fontFamily: 'monospace', margin: 0, lineHeight: 1.4 }}>
                      &lt;body&gt;<br/>
                      &nbsp;&nbsp;&lt;h1&gt;Aura Boutique&lt;/h1&gt;<br/>
                      &nbsp;&nbsp;<span style={{ background: 'rgba(99,102,241,0.18)', border: '1px dashed #6366f1', padding: '1px 3px', borderRadius: 3, color: c.text }}>&lt;script src="..."&gt;&lt;/script&gt;</span><br/>
                      &lt;/body&gt;
                    </pre>
                  </div>
                )}
                {activeStep === 3 && (
                  <div style={{ width: '100%', maxWidth: 230, padding: 16, background: dark ? '#161619' : '#f0f0f4', border: `1px solid ${c.border}`, borderRadius: 16, position: 'relative', height: 110, alignSelf: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>Mock Store Page</span>
                    <div style={{ background: c.muted, height: 3, width: '50%', borderRadius: 2, marginTop: 6, opacity: 0.6 }} />
                    <div style={{ background: c.muted, height: 3, width: '30%', borderRadius: 2, marginTop: 4, opacity: 0.6 }} />
                    
                    {/* Pulsing button */}
                    <div style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: '#6366f1',
                      color: '#fff',
                      padding: '6px 10px',
                      borderRadius: 15,
                      fontSize: 9,
                      fontWeight: 700,
                      boxShadow: '0 4px 10px rgba(99,102,241,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      animation: 'pulse 1.5s infinite'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> Live Shop
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{
        padding: '80px 24px 40px',
        background: dark ? '#09090b' : '#fafbfc',
        backgroundImage: dark 
          ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)' 
          : 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.03) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2
      }}>
        {/* Ambient radial glow behind the code block */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          background: dark 
            ? 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Zero Complexity</p>
            <h2 className="lp-reveal" style={{ fontSize: 34, fontWeight: 800, letterSpacing: -.8 }}>This is all you need</h2>
          </div>
          <div className="lp-glow lp-reveal-scale" style={{ background: '#09090b', borderRadius: 20, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
              {['#ff5f57','#febc2e','#28c840'].map(cc => <div key={cc} style={{ width: 10, height: 10, borderRadius: '50%', background: cc }} />)}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#52525b', fontFamily: 'monospace' }}>index.html</span>
            </div>
            <pre style={{ fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', whiteSpace: 'pre-wrap', fontFamily: 'SF Mono, Menlo, Courier, monospace' }}>
              <span style={{ color: '#52525b' }}>{'<!-- Add live shopping widget to body -->'}</span>{'\n'}
              <span style={{ color: '#c084fc' }}>{'<script '}</span>
              <span style={{ color: '#4ade80' }}>src</span>
              <span style={{ color: '#a1a1aa' }}>=</span>
              <span style={{ color: '#fbbf24' }}>"https://shopcall.store/sdk/shopcall-sdk.js"</span>{'\n'}
              {'  '}<span style={{ color: '#4ade80' }}>data-store</span>
              <span style={{ color: '#a1a1aa' }}>=</span>
              <span style={{ color: '#fbbf24' }}>"YOUR_SDK_KEY"</span>
              <span style={{ color: '#c084fc' }}>{'>'}</span>
              <span style={{ color: '#c084fc' }}>{'</script>'}</span>
            </pre>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="lp-section" style={{ padding: '80px 24px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="lp-reveal" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Flexible Pricing</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.8, marginBottom: 20 }}>Simple, predictable pricing</h2>
            
            {/* Toggle Switch */}
            <div className="lp-reveal lp-reveal-d2" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: dark ? '#161619' : '#f0f0f4', border: `1px solid ${c.border}`, borderRadius: 30, padding: 4 }}>
              <button onClick={() => setIsAnnual(false)} style={{ background: !isAnnual ? '#6366f1' : 'transparent', color: !isAnnual ? '#fff' : c.muted, border: 'none', padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>Monthly</button>
              <button onClick={() => setIsAnnual(true)} style={{ background: isAnnual ? '#6366f1' : 'transparent', color: isAnnual ? '#fff' : c.muted, border: 'none', padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 6 }}>
                Yearly <span style={{ fontSize: 9, background: '#22c55e', color: '#fff', padding: '2px 6px', borderRadius: 8 }}>Save 20%</span>
              </button>
            </div>
          </div>

          <div className="lp-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {pricing.map((p, i) => (
              <div key={p.name} className={`lp-card lp-reveal lp-reveal-d${i + 1}`} style={{ background: c.card, borderRadius: 20, padding: 36, border: p.popular ? '2px solid #6366f1' : `1px solid ${c.border}`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.8 }}>Most popular</div>}
                
                <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{p.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 38, fontWeight: 900, letterSpacing: -.8 }}>{getDisplayPrice(p.price)}</span>
                  <span style={{ fontSize: 13, color: c.muted }}>{isAnnual && p.price !== '₹0' ? '/mo billed annually' : p.sub}</span>
                </div>
                <p style={{ fontSize: 13, color: c.muted, marginBottom: 28 }}>{isAnnual && p.price !== '₹0' ? `Save 20% on annual billing` : `Billed monthly`}</p>
                
                <ul style={{ listStyle: 'none', marginBottom: 32, flex: 1 }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: 14, color: c.text, padding: '7px 0', display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ color: '#6366f1', fontWeight: 'bold' }}>✓</span>{f}</li>)}
                </ul>

                <Link to="/signup" className={p.popular ? 'lp-cta' : 'lp-cta-ghost'} style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', background: p.popular ? '#6366f1' : 'transparent', color: p.popular ? '#fff' : c.text, border: p.popular ? 'none' : `1px solid ${c.border}` }}>
                  {p.popular ? 'Start Free Trial' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
          
          <p style={{ textAlign: 'center', marginTop: 40, fontSize: 14, color: c.muted }} className="lp-reveal">
            Have high-volume or enterprise custom requirements? <span onClick={() => setShowDemo(true)} style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Book a 1-on-1 Guided Demo</span> with our technical sales team.
          </p>
        </div>
      </section>

      {/* FAQ SECTION (REWORKED TO DUAL-COLUMN PARALLEL VIEW) */}
      <section id="faq" className="lp-section" style={{ padding: '80px 24px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="lp-reveal" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Answering Queries</p>
            <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.8 }}>Frequently Asked Questions</h2>
          </div>

          <div className="lp-faq-grid">
            {/* Left FAQ Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {leftFAQs.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div 
                    key={i} 
                    className="lp-reveal" 
                    style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s ease' }}
                  >
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', color: c.text, fontSize: 15, fontWeight: 600, outline: 'none' }}
                    >
                      <span>{f.q}</span>
                      <span style={{ fontSize: 18, color: '#6366f1', transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
                    </button>
                    <div style={{ 
                      maxHeight: isOpen ? 250 : 0, 
                      opacity: isOpen ? 1 : 0, 
                      transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out', 
                      overflow: 'hidden' 
                    }}>
                      <p style={{ padding: '0 24px 20px', color: c.muted, fontSize: 13, lineHeight: 1.6 }}>{f.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right FAQ Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rightFAQs.map((f, i) => {
                const absIndex = half + i;
                const isOpen = openFaq === absIndex;
                return (
                  <div 
                    key={absIndex} 
                    className="lp-reveal" 
                    style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s ease' }}
                  >
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : absIndex)}
                      style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', color: c.text, fontSize: 15, fontWeight: 600, outline: 'none' }}
                    >
                      <span>{f.q}</span>
                      <span style={{ fontSize: 18, color: '#6366f1', transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
                    </button>
                    <div style={{ 
                      maxHeight: isOpen ? 250 : 0, 
                      opacity: isOpen ? 1 : 0, 
                      transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out', 
                      overflow: 'hidden' 
                    }}>
                      <p style={{ padding: '0 24px 20px', color: c.muted, fontSize: 13, lineHeight: 1.6 }}>{f.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-section" style={{ padding: '80px 24px 40px', textAlign: 'center', background: dark ? 'rgba(12,12,14,0.6)' : '#fafbfc', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          {/* Custom Connected Commerce Visual */}
          <div className="lp-reveal lp-float" style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: 320, 
            height: 140, 
            margin: '0 auto 40px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            zIndex: 5
          }}>
            {/* Glowing background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: dark ? 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
              zIndex: 1
            }} />
            
            {/* Connection stream line */}
            <div style={{
              position: 'absolute',
              left: '25%',
              right: '25%',
              height: 2,
              borderTop: '2px dashed #6366f1',
              opacity: 0.5,
              zIndex: 2,
              animation: 'streamPulse 2s infinite ease-in-out'
            }} />

            {/* Shopper Card (Left) */}
            <div style={{
              position: 'absolute',
              left: 0,
              background: c.card,
              border: `1px solid ${c.border}`,
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 3,
              boxShadow: '0 10px 20px rgba(0,0,0,0.06)'
            }}>
              <span style={{ fontSize: 20 }}>🛍️</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 11, fontWeight: 700 }}>Shopper</p>
                <p style={{ fontSize: 8, color: c.muted }}>On Store</p>
              </div>
            </div>

            {/* Agent Showroom Card (Right) */}
            <div style={{
              position: 'absolute',
              right: 0,
              background: c.card,
              border: `1px solid ${c.border}`,
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 3,
              boxShadow: '0 10px 20px rgba(0,0,0,0.06)'
            }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 11, fontWeight: 700 }}>Showroom</p>
                <p style={{ fontSize: 8, color: '#22c55e', fontWeight: 600 }}>● Connected</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>

            {/* Floating Sale Closed Badge */}
            <div style={{
              position: 'absolute',
              top: 5,
              background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
              color: '#fff',
              borderRadius: 20,
              padding: '5px 12px',
              fontSize: 9,
              fontWeight: 700,
              boxShadow: '0 6px 16px rgba(99,102,241,0.3)',
              zIndex: 4,
              animation: 'floatingBadge 3s ease-in-out infinite'
            }}>
              💸 Closed: ₹14,999
            </div>
          </div>
          <h2 className="lp-reveal lp-reveal-d1" style={{ fontSize: 38, fontWeight: 800, letterSpacing: -.8, marginBottom: 16 }}>{finalCta.title}</h2>
          <p className="lp-reveal lp-reveal-d2" style={{ color: c.muted, fontSize: 18, lineHeight: 1.6, marginBottom: 36 }}>{finalCta.subtitle}</p>
          <div className="lp-reveal lp-reveal-d3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', width: '100%' }} className="lp-cta-row">
              <Link to="/signup" className="lp-cta" style={{ background: '#6366f1', color: '#fff', padding: '16px 36px', borderRadius: 10, fontSize: 17, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                {finalCta.button} <span style={{ fontSize: 20 }}>→</span>
              </Link>
              <button onClick={() => setShowDemo(true)} className="lp-cta-ghost" style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.text, padding: '16px 36px', borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Book 1-on-1 Demo
              </button>
            </div>
            <p style={{ color: c.muted, fontSize: 13, marginTop: 8 }}>{finalCta.note}</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-section" style={{ padding: '64px 24px 32px', background: dark ? '#09090b' : '#ffffff', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top: Brand + Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', gap: 48, marginBottom: 48 }} className="lp-footer-grid">
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <LogoIcon size={32} />
                <span style={{ fontSize: 18, fontWeight: 800 }}>ShopCall</span>
              </div>
              <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.6, maxWidth: 280 }}>{footer?.tagline || ''}</p>
              {/* Socials */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {(footer?.socials || []).map(s => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.muted, textDecoration: 'none', fontSize: 13, transition: 'all .2s' }} title={s.platform}>
                    {s.platform === 'Twitter' ? '𝕏' : s.platform === 'LinkedIn' ? 'in' : s.platform === 'Instagram' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> : s.platform === 'YouTube' ? '▶' : s.platform[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {(footer?.columns || []).map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: c.text }}>{col.title}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {(col.links || []).map(link => (
                    <li key={link.label} style={{ marginBottom: 10 }}>
                      {link.label === 'Contact Us' ? (
                        <button onClick={() => setShowContact(true)} style={{ color: c.muted, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color .2s' }}>{link.label}</button>
                      ) : link.url?.startsWith('#') || link.url?.startsWith('http') ? (
                        <a href={link.url} target={link.url?.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ color: c.muted, fontSize: 14, textDecoration: 'none', transition: 'color .2s' }}>{link.label}</a>
                      ) : (
                        <Link to={link.url || '/'} style={{ color: c.muted, fontSize: 14, textDecoration: 'none', transition: 'color .2s' }}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: c.muted }}>{footer?.copyright || '© 2026 ShopCall'}</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/dashboard" style={{ color: c.muted, fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/agent-login" style={{ color: c.muted, fontSize: 13, textDecoration: 'none' }}>Agent Login</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CONTACT MODAL */}
      {showContact && <Modal dark={dark} c={c} onClose={() => { setShowContact(false); setFormMsg(''); }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Contact Us</h3>
        <p style={{ fontSize: 14, color: c.muted, marginBottom: 20 }}>We'd love to hear from you. Leave your details and we'll get back to you.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const res = await fetch(`${API}/requests/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), phone: fd.get('phone') }) });
          if (res.ok) { setFormMsg('✓ Submitted! We will contact you within 24 hours.'); e.target.reset(); } else setFormMsg('Something went wrong. Try again.');
        }}>
          <div className="lp-input-group">
            <input name="name" required placeholder="Your Name" className="lp-input" />
            <svg className="lp-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="lp-input-group">
            <input name="phone" required placeholder="Phone Number" type="tel" className="lp-input" />
            <svg className="lp-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          {formMsg && <p style={{ fontSize: 13, color: formMsg.startsWith('✓') ? '#22c55e' : '#ef4444', marginBottom: 12 }}>{formMsg}</p>}
          <button type="submit" className="lp-cta" style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Submit</button>
          <p style={{ fontSize: 12, color: c.muted, marginTop: 12, textAlign: 'center' }}>Average response time is 24 hours</p>
        </form>
      </Modal>}

      {/* BOOK DEMO MODAL */}
      {showDemo && <Modal dark={dark} c={c} onClose={() => { setShowDemo(false); setFormMsg(''); }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Book a Demo</h3>
        <p style={{ fontSize: 14, color: c.muted, marginBottom: 20 }}>Schedule a personalized demo with our product expert.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const res = await fetch(`${API}/requests/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), preferredDate: fd.get('preferredDate'), preferredTime: fd.get('preferredTime') }) });
          if (res.ok) { setFormMsg('✓ Demo request submitted!'); e.target.reset(); } else setFormMsg('Something went wrong. Try again.');
        }}>
          <div className="lp-input-group">
            <input name="name" required placeholder="Full Name" className="lp-input" />
            <svg className="lp-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="lp-input-group">
            <input name="email" required type="email" placeholder="Email Address" className="lp-input" />
            <svg className="lp-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div className="lp-input-group">
            <input name="phone" required type="tel" placeholder="Phone Number" className="lp-input" />
            <svg className="lp-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div className="lp-form-row">
            <div className="lp-input-group" style={{ flex: 1, marginBottom: 0 }}>
              <input name="preferredDate" required type="date" className="lp-input" onClick={e => e.target.showPicker()} />
              <svg className="lp-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="lp-input-group" style={{ flex: 1, marginBottom: 0 }}>
              <input name="preferredTime" required type="time" className="lp-input" onClick={e => e.target.showPicker()} />
              <svg className="lp-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          {formMsg && <p style={{ fontSize: 13, color: formMsg.startsWith('✓') ? '#22c55e' : '#ef4444', marginBottom: 12 }}>{formMsg}</p>}
          <button type="submit" className="lp-cta" style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Book Demo</button>
          <p style={{ fontSize: 12, color: c.muted, marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>Average response time is 12 hours</p>
        </form>
      </Modal>}
    </div>
  );
}

function Modal({ dark, c, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: dark ? '#111113' : '#fff', borderRadius: 24, padding: 36, maxWidth: 440, width: '100%', border: `1px solid ${c.border}`, boxShadow: '0 24px 64px rgba(0,0,0,.3)', animation: 'lpEnter .3s cubic-bezier(.16,1,.3,1)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${c.border}`, color: c.muted, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }} className="lp-modal-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        {children}
      </div>
    </div>
  );
}

const D = { bg: '#09090b', text: '#f4f4f5', muted: '#a1a1aa', card: 'rgba(17, 17, 19, 0.75)', border: 'rgba(255, 255, 255, 0.08)' };
const L = { bg: '#ffffff', text: '#18181b', muted: '#71717a', card: 'rgba(255, 255, 255, 0.8)', border: 'rgba(9, 9, 11, 0.08)' };
