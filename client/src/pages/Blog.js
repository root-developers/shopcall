import React, { useState, useEffect } from 'react';

const BLOG_POSTS = [
  {
    id: 'zoom-video-sdk-vs-meeting-sdk',
    title: 'Zoom Video SDK vs Meeting SDK: Integration, Pricing, and Alternatives',
    desc: 'An in-depth developer comparison of Zoom Video SDK vs Meeting SDK integration patterns, pricing structures, and how to deploy a video sdk live session with a React video sdk.',
    category: 'Developer Guides',
    readTime: '7 min read',
    date: 'June 04, 2026',
    author: 'Amit Sen, Tech Lead',
    content: `
      <p>When looking to add real-time video features to your website, selecting the correct <strong>video sdk</strong> is crucial. For developers evaluating Zoom's offerings, the choice between the <strong>Zoom Video SDK vs Meeting SDK</strong> represents two completely different architectures, integration paths, and pricing models.</p>
      
      <h2>1. The Key Differences</h2>
      <p>The <strong>Zoom Meeting SDK</strong> allows you to embed the familiar Zoom Meetings client interface (complete with chat, participant grids, and recording buttons) inside your application. It acts as a wrapper around a standard Zoom meeting room.</p>
      <p>The <strong>Zoom Video SDK</strong>, on the other hand, does not include any pre-built UI components. It gives developers raw, secure audio and video streams. This allows you to design a fully customized user interface tailored to your brand, which is ideal if you want to <strong>embed video sdk</strong> widgets inside e-commerce storefronts or dashboard screens.</p>
      
      <h2>2. Zoom Video SDK Pricing</h2>
      <p>Understanding <strong>zoom video sdk pricing</strong> is critical for scaling businesses. While the Meeting SDK uses standard host licensing models, the Video SDK charges based on minutes of usage. Zoom typically offers a free tier (e.g., 10,000 minutes per month), after which usage is billed at flat rates (e.g., $0.0035 per minute). Keep in mind that audio dial-in options and cloud recording incur extra, separate charges.</p>
      
      <h2>3. Embedding a React Video SDK</h2>
      <p>If you are building a modern web application, choosing a <strong>react video sdk</strong> makes building layouts much simpler. To <strong>integrate video sdk</strong> streams in React:</p>
      <ul>
        <li>Install the provider wrapper.</li>
        <li>Acquire a secure client token from your Node/Express backend.</li>
        <li>Instantiate a <strong>live video sdk</strong> meeting container using React hooks.</li>
      </ul>
      
      <h2>4. Scaling a Video SDK Live Session</h2>
      <p>When running a high-traffic e-commerce campaign, keeping your <strong>video sdk live</strong> feeds running smoothly is paramount. Integrating a <strong>video sdk live</strong> framework like VideoSDK.live or Agora requires you to manage region-specific routing, token lifespans, and participant scale. If not configured correctly, a <strong>video sdk live</strong> session can experience lag, audio feedback, or high video latency.</p>

      <h2>5. ShopCall: The Tailored Alternative</h2>
      <p>While building a custom <strong>online video sdk</strong> flow using Zoom or Agora is powerful, it requires weeks of development, TURN/STUN configuration, and UI programming. ShopCall serves as a fully managed video commerce layer. We wrap high-performance video infrastructure into a 2-line embed script, giving you a custom-designed, optimized buyer-agent calling experience out of the box.</p>
    `
  },
  {
    id: 'transforming-boutique-sales-india',
    title: 'How Live Video Commerce is Transforming Saree & Boutique Sales in India',
    desc: 'Why Indian boutique shoppers want to see sarees and jewelry live before buying, and how video calling increases store sales by 4x.',
    category: 'Industry Trends',
    readTime: '6 min read',
    date: 'May 28, 2026',
    author: 'Pooja Sen, Live Sales Consultant',
    content: `
      <p>Shopping in India has always been a social, high-touch experience. When it comes to buying high-value clothing like designer bridal sarees, handloom silks, fine jewelry, or custom boutique dresses, customers rarely trust static pictures. They want to touch the fabric, see how it drapes, and verify the true color of the zari borders under different lights.</p>
      
      <h2>The Digital Trust Deficit</h2>
      <p>For online boutique stores, this trust deficit is the single biggest reason for cart abandonment. Customers hesitate, wondering: <i>"Will the fabric feel cheap?" "Is the color exactly as shown in the picture?" "How does the back look?"</i> Standard messaging apps like WhatsApp are slow, cluttered, and require customers to save numbers, causing massive drop-offs.</p>
      
      <h2>Enter 1-on-1 Live Video Commerce</h2>
      <p>By embedding a direct video call widget on the product page, stores allow shoppers to click a single button and instantly talk to an in-store agent. The agent can show different patterns, match blouses live, and handle objections instantly. The results are astronomical:</p>
      <ul>
        <li><strong>Increased Order Value:</strong> Customers are 45% more likely to purchase cross-sell items matching their main dress.</li>
        <li><strong>Near-Zero Return Rates:</strong> Since they have inspected the item live on camera, return rates drop below 2%.</li>
        <li><strong>Direct Relationship:</strong> Customers build a direct connection with your brand, fostering repeat purchases.</li>
      </ul>
      
      <h2>Key Takeaway</h2>
      <p>Indian boutique commerce is ready for live video. Stop forcing customers to rely on static 2D images. Bring your offline showroom online today and see the difference.</p>
    `
  },
  {
    id: 'reduce-cart-abandonment-video',
    title: '5 Proven Tactics to Reduce Checkout Cart Abandonment using Video Calls',
    desc: 'Struggling with drop-offs at checkout? Learn how integrating a live shop widget at the checkout flow rescues abandoned carts.',
    category: 'Optimization',
    readTime: '5 min read',
    date: 'June 01, 2026',
    author: 'Devendra Gowda, Product Lead',
    content: `
      <p>An average e-commerce site loses 70% of its shoppers at the checkout stage. While many brands try retargeting emails and SMS alerts, the root cause is often unresolved questions. Shoppers drop off because of last-minute doubts about sizing, shipping policies, returns, or payment options.</p>

      <h2>1. The "Checkout Rescue" Floating Button</h2>
      <p>Place a minimizable "Live Assist" button specifically on the checkout and cart pages. When a user hovers or spends too long on the page, a subtle micro-animation can prompt them to call an agent for support.</p>

      <h2>2. Address Sizing & Fit Live</h2>
      <p>Sizing is the #1 concern for online fashion shoppers. An agent can pick up the call, stand in front of the camera, and physically show the size measurements next to a standard tape, immediately reassuring the customer.</p>

      <h2>3. Share Direct Links in Chat</h2>
      <p>During the call, if a customer complains that the item is out of stock in their size, the agent can recommend a similar style and paste the direct checkout link in the integrated chat box. High-touch navigation increases conversions instantly.</p>

      <h2>4. Highlight Return Policies</h2>
      <p>Use the live video call to explain your return policies and guarantees. Speaking with a real person builds 10x more trust than a legalistic policy page.</p>

      <h2>5. Offer Live Custom Coupons</h2>
      <p>If the user is hesitant due to pricing, the agent can offer a limited-time coupon code inside the chat. This creates urgency and triggers immediate closure.</p>
    `
  },
  {
    id: 'virtual-showroom-guide',
    title: 'The Beginner’s Guide to Setting Up a Virtual Showroom for E-commerce',
    desc: 'A complete walkthrough of the lighting, camera setup, and software tools needed to launch a video calling station for your online store.',
    category: 'Tutorials',
    readTime: '8 min read',
    date: 'June 03, 2026',
    author: 'Vikram Mehta, E-com Ops Specialist',
    content: `
      <p>Setting up a virtual showroom doesn’t require a Hollywood-budget studio. With standard smartphones, proper ring lights, and an easy SDK like ShopCall, you can turn a small table in your store or warehouse into a high-converting sales channel.</p>

      <h2>1. Natural Lighting is Key</h2>
      <p>Avoid harsh fluorescent overhead lights. Place two warm-light ring lights at 45-degree angles to illuminate the products. Accurate color rendering is crucial for sarees, jewelry, and cosmetics.</p>

      <h2>2. Choosing the Right Camera Gear</h2>
      <p>You don't need DSLRs. A modern mid-range Android phone or iPhone has exceptional front/back cameras. Make sure your agents use the back camera to showcase products and the front camera for conversation.</p>

      <h2>3. Sound Isolation</h2>
      <p>Choose a relatively quiet corner of your store. Use neckband microphones or wireless clip-on mics to filter out background noise, ensuring your agent's voice is crisp and professional.</p>

      <h2>4. Integration via ShopCall</h2>
      <p>Instead of manual WhatsApp video calls (where you must expose personal phone numbers and queue calls manually), use ShopCall. The SDK embeds a widget directly into your site, distributing incoming calls to any active agent's laptop or phone dashboard.</p>
    `
  }
];

export default function Blog({ dark, c }) {
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    if (selectedPostId) {
      const post = BLOG_POSTS.find(p => p.id === selectedPostId);
      if (post) {
        document.title = `${post.title} | ShopCall Blog`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', post.desc);
      }
    } else {
      document.title = 'Blog | ShopCall - Live Video Commerce insights';
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'Read industry insights, guides, and tutorials on live video shopping, virtual showrooms, and improving boutique sales conversions.');
    }
    window.scrollTo(0, 0);
  }, [selectedPostId]);

  const activePost = BLOG_POSTS.find(p => p.id === selectedPostId);

  return (
    <div className="lp-enter" style={{ maxWidth: 850, margin: '0 auto', padding: '60px 24px 100px', width: '100%' }}>
      {activePost ? (
        /* Blog Post Content */
        <article>
          <button 
            onClick={() => setSelectedPostId(null)}
            style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 30, padding: 0 }}
          >
            ← Back to Blog
          </button>
          
          <div style={{ marginBottom: 30 }}>
            <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
              {activePost.category}
            </span>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginTop: 16, marginBottom: 12, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              {activePost.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, fontSize: 14, color: c.muted, flexWrap: 'wrap' }}>
              <span>By {activePost.author}</span>
              <span>•</span>
              <span>{activePost.date}</span>
              <span>•</span>
              <span>{activePost.readTime}</span>
            </div>
          </div>

          <div 
            className="blog-content"
            style={{ fontSize: 16, lineHeight: 1.8, color: dark ? '#d4d4d8' : '#3f3f46' }}
            dangerouslySetInnerHTML={{ __html: activePost.content }}
          />

          <style>{`
            .blog-content h2 { font-size: 22px; font-weight: 700; color: ${c.text}; margin-top: 36px; margin-bottom: 12px; }
            .blog-content p { margin-bottom: 20px; }
            .blog-content ul { margin-left: 20px; margin-bottom: 20px; }
            .blog-content li { margin-bottom: 8px; }
            .blog-content i { color: ${c.muted}; }
          `}</style>

          <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 60, paddingTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: c.muted }}>Share this post:</span>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Twitter', 'LinkedIn', 'Facebook'].map(p => (
                <button key={p} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: c.text }}>{p}</button>
              ))}
            </div>
          </div>
        </article>
      ) : (
        /* Blog Index Page */
        <div>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Resources & Guides</span>
            <h1 style={{ fontSize: '42px', fontWeight: 800, marginTop: 16, marginBottom: 20, letterSpacing: '-0.03em' }}>
              The ShopCall <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Insights</span>
            </h1>
            <p style={{ fontSize: 16, color: c.muted, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Articles, interviews, and actionable tutorials to help you master live video commerce and scale your digital boutique.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {BLOG_POSTS.map(post => (
              <div 
                key={post.id} 
                className="lp-card" 
                onClick={() => setSelectedPostId(post.id)}
                style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 32, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(99,102,241,0.06)', color: '#6366f1', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: 12, color: c.muted }}>{post.readTime}</span>
                </div>
                
                <h3 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.6 }}>{post.desc}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: c.muted }}>{post.date}</span>
                  <span style={{ color: '#6366f1', fontSize: 14, fontWeight: 600 }}>Read Article →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
