# ShopCall — Live Video Commerce SDK

## About

ShopCall is a live video commerce platform that lets any e-commerce store add a "Live Shop" video call button with just 2 lines of code. Customers browsing a store can instantly connect with a sales agent via HD video call — no app downloads, no signups, no friction.

Built for Indian e-commerce businesses (saree shops, jewelry stores, electronics, fashion boutiques) where customers want to see products live before buying.

---

## Brief

- **What**: Embeddable live video shopping widget for e-commerce websites
- **Who**: Store owners who want to sell via live video (like a virtual showroom)
- **How**: Add one `<script>` tag → customers click "Live Shop" → instant video call with store agent
- **Why**: Increases conversion by 3-5x compared to static product pages. Customers trust what they see live.

---

## Detailed Overview

### How It Works

1. **Store owner** signs up on ShopCall dashboard → gets an SDK key
2. **Adds one script tag** to their website:
   ```html
   <script src="https://yourdomain.com/sdk/shopcall-sdk.js" data-store="YOUR_SDK_KEY"></script>
   ```
3. A floating "Live Shop" button appears on their site
4. **Customer clicks** the button → enters name → video call starts
5. **Store agent** sees incoming call on dashboard → accepts → live video session begins
6. Agent shows products on camera, customer asks questions, deal closes

### Key Flows

| Flow | Description |
|------|-------------|
| Customer → Agent | Customer initiates call from store website, agent accepts from dashboard |
| Multi-agent | Store can have multiple agents; any available agent picks up |
| Callback | If agents are busy/offline, customer leaves phone number for callback |
| Chat | In-call text chat for sharing links, prices, order details |
| Admin Panel | Super admin manages all stores, approves plan upgrades, monitors usage |

---

## Features

### SDK Widget (Customer Side)
- 🎥 HD video calling with adaptive quality
- 📷 Front/back camera switch (mobile)
- 🔇 Mute/unmute mic and camera toggle
- 🌫️ Real-time background blur (MediaPipe AI)
- 💬 In-call text chat with link sharing
- 📐 Multiple video layouts (Spotlight, Top-Bottom, Left-Right)
- 📌 Pin self/remote video
- 🖼️ Picture-in-Picture mode
- 📱 Fully responsive (works on all screen sizes)
- 🔄 Minimizable floating window (browse while on call)
- 🎨 Customizable button (color, text, position, size, radius)
- 📞 Callback request when agents unavailable
- 🔒 End-to-end encrypted video (via VideoSDK)

### Store Dashboard (Agent Side)
- 📊 Real-time call notifications with push alerts
- 👥 Multi-agent support with online/offline status
- 📈 Call history and analytics
- 🎛️ Camera/mic/screen share controls
- 🌫️ Background blur for agents too
- 💬 Chat with customers during call
- 📋 Lead capture (name + phone from every call)
- 🔔 Browser push notifications for incoming calls

### Admin Panel
- 🏪 Manage all registered stores
- 💳 Approve/reject plan upgrade requests
- 📊 Platform-wide analytics
- 👤 User management

---

## Pricing

| Plan | Price | Calls/month | Agents | Best For |
|------|-------|-------------|--------|----------|
| **Trial** | ₹0 (Free) | 5 calls | 1 | Testing the platform |
| **Starter** | ₹999/month | 200 calls | 3 | Small stores, solo sellers |
| **Pro** | ₹2,999/month | Unlimited | 10 | Growing businesses, teams |

### What's Included in All Plans
- HD video quality
- Background blur
- In-call chat
- Camera switch
- Lead capture
- Push notifications
- Customizable widget

---

## Benefits

### For Store Owners
- **Higher conversions** — Customers who see products live are 3-5x more likely to buy
- **Zero development** — Add 1 script tag, done. No coding needed.
- **Trust building** — Live video builds instant trust vs static images
- **Lead capture** — Every caller's name and phone is saved automatically
- **Cost effective** — Cheaper than hiring for a physical showroom

### For Customers
- **No app download** — Works directly in the browser
- **No signup required** — Just enter name and start calling
- **See products live** — Ask the seller to show different angles, colors, sizes
- **Mobile friendly** — Works perfectly on phone browsers
- **Privacy** — Background blur hides personal space

### For the Business
- **Reduce returns** — Customers know exactly what they're buying
- **Upsell opportunity** — Agents can suggest complementary products live
- **Build relationships** — Personal touch creates repeat customers
- **Data insights** — Call duration, frequency, peak hours analytics

---

## Our Features & Pricing vs Competitors

| Feature | ShopCall | Meesho Live | GoKwik | Whatmore |
|---------|----------|-------------|--------|----------|
| 1-on-1 video calls | ✅ | ❌ (broadcast only) | ❌ | ❌ |
| 2-line integration | ✅ | ❌ (complex SDK) | ❌ | ❌ |
| Background blur | ✅ | ❌ | ❌ | ❌ |
| Camera switch | ✅ | ✅ | N/A | N/A |
| In-call chat | ✅ | ✅ | ❌ | ❌ |
| No customer app needed | ✅ | ❌ | ✅ | ✅ |
| Lead capture | ✅ | ❌ | ✅ | ❌ |
| Push notifications | ✅ | ❌ | ❌ | ❌ |
| Multi-agent | ✅ | N/A | ❌ | ❌ |
| Starting price | ₹999/mo | ₹5,000+/mo | ₹3,000+/mo | ₹2,500+/mo |
| Free trial | ✅ (5 calls) | ❌ | ❌ | Limited |

### Why ShopCall Wins

| Aspect | ShopCall | Others |
|--------|----------|--------|
| **Setup time** | 2 minutes | Hours to days |
| **Integration** | 1 script tag | SDK + API + webhooks |
| **Video type** | 1-on-1 personal | Broadcast/livestream |
| **Target** | Individual stores | Enterprise only |
| **Pricing** | From ₹999/mo | From ₹3,000-5,000/mo |
| **Video infra cost** | Low (VideoSDK India) | High (Twilio/Agora) |

### Cost Comparison (for 200 calls/month)

| Platform | Monthly Cost | Per-call Cost |
|----------|-------------|---------------|
| **ShopCall** | ₹999 | ~₹5/call |
| Twilio Video (DIY) | ₹8,000+ | ~₹40/call |
| Daily.co (DIY) | ₹6,000+ | ~₹30/call |
| Custom Agora build | ₹12,000+ | ~₹60/call |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
│                                                                   │
│  Landing Page → Signup/Login → Store Dashboard → Agent Call Page  │
│  Admin Login → Admin Panel                                        │
│  Agent Login → Agent Dashboard → Agent Call Page                  │
│                                                                   │
│  Uses: React Router, VideoSDK React SDK, Socket.IO Client         │
└──────────────────────────────┬────────────────────────────────────┘
                               │ HTTP + WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Express + Node.js)                   │
│                                                                   │
│  Routes:                                                          │
│    /api/auth      → Signup, Login, JWT tokens                     │
│    /api/video     → Create/join meetings, end calls               │
│    /api/calls     → Call history, analytics                        │
│    /api/agents    → Agent CRUD, online status                     │
│    /api/billing   → Plans, upgrades, payment tracking             │
│    /api/push      → Push notification subscriptions               │
│    /api/admin     → Admin operations                              │
│    /api/site      → Landing page CMS content                      │
│                                                                   │
│  Real-time: Socket.IO (call signaling, chat, notifications)       │
│  Security: Helmet, CORS, Rate Limiting, JWT Auth                  │
│                                                                   │
│  /sdk/shopcall-sdk.js → Embeddable widget (served as static)      │
└──────────────────────────────┬────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│    MongoDB        │ │   VideoSDK.live  │ │   Web Push       │
│                   │ │                  │ │                   │
│ Users, Calls,     │ │ Video rooms,     │ │ Push notifications│
│ Agents, Billing,  │ │ tokens, media    │ │ for incoming      │
│ Leads, Chats      │ │ infrastructure   │ │ calls             │
└──────────────────┘ └─────────────────┘ └──────────────────┘
```

### Data Flow: Customer Makes a Call

```
Customer Browser                Server                    Agent Dashboard
      │                           │                            │
      │── POST /video/join ──────▶│                            │
      │◀── { callId, status } ────│                            │
      │                           │── Socket: new-call ───────▶│
      │                           │                            │
      │                           │◀── Socket: accept-call ────│
      │                           │── Generate VideoSDK room ──│
      │◀── Socket: call-accepted ─│── Socket: call-accepted ──▶│
      │     { meetingId, token }  │    { meetingId, token }    │
      │                           │                            │
      │════ VideoSDK P2P Video ═══════════════════════════════▶│
      │◀═══════════════════════════════════════════════════════╡│
      │                           │                            │
      │── Socket: chat-message ──▶│── Socket: chat-message ──▶│
      │◀── Socket: chat-message ──│◀── Socket: chat-message ──│
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 | Component-based, fast rendering |
| **Routing** | React Router 6 | SPA navigation |
| **Video (React)** | @videosdk.live/react-sdk | React hooks for video |
| **Video (SDK widget)** | VideoSDK JS SDK 0.0.86 | Vanilla JS, no framework dependency |
| **AI/ML** | MediaPipe Selfie Segmentation | Real-time background blur |
| **Backend** | Express.js (Node.js) | Fast, minimal, scalable |
| **Database** | MongoDB (Mongoose) | Flexible schema, fast reads |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Stateless, secure |
| **Real-time** | Socket.IO | WebSocket with fallback |
| **Push** | Web Push (web-push) | Browser notifications |
| **Security** | Helmet + express-rate-limit | Headers + DDoS protection |
| **Video Infra** | VideoSDK.live | India-based, cheapest, $20 free credit |

---

## Directory Structure

```
ShopCall/
├── client/                  → React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.js        → Marketing landing page
│   │   │   ├── Login.js          → Store owner login
│   │   │   ├── Signup.js         → Store owner registration
│   │   │   ├── Dashboard.js      → Store owner dashboard
│   │   │   ├── AgentLogin.js     → Agent login
│   │   │   ├── AgentDashboard.js → Agent call queue
│   │   │   ├── AgentCall.js      → Video call page (agent)
│   │   │   ├── AdminLogin.js     → Admin login
│   │   │   └── AdminPanel.js     → Platform admin panel
│   │   ├── App.js                → Router setup
│   │   └── usePush.js            → Push notification hook
│   └── public/
├── server/                  → Express backend
│   ├── models/              → Mongoose schemas
│   ├── routes/              → API endpoints
│   ├── middleware/          → JWT auth middleware
│   ├── sdk/
│   │   └── shopcall-sdk.js  → Embeddable widget (the product)
│   └── index.js             → Server entry point
├── test-store.html          → Demo store for testing SDK
└── package.json             → Root scripts (dev, install-all)
```

---

*Built with ❤️ for Indian e-commerce sellers who want to bring the showroom experience online.*
