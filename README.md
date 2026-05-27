# ShopCall - Live Video Commerce SDK

Live video shopping SDK for e-commerce stores. Any store can add a "Live Shop" button with 2 lines of code.

## Setup

### 1. Get VideoSDK.live credentials
- Go to https://www.videosdk.live/ and sign up (free, no card needed)
- Get your API Key and Secret from the dashboard

### 2. Configure environment
```bash
cd server
# Edit .env file with your credentials:
# VIDEOSDK_API_KEY=your_key
# VIDEOSDK_SECRET=your_secret
# MONGODB_URI=mongodb://localhost:27017/shopcall
```

### 3. Install & Run
```bash
# Install all dependencies
npm run install-all

# Start both server and client
npm run dev
```

- Server runs on http://localhost:5000
- Client runs on http://localhost:3000

### 4. Test the flow
1. Open http://localhost:3000 → Sign up as a store owner
2. Copy your SDK key from the dashboard
3. Open `test-store.html`, replace `YOUR_SDK_KEY` with your key
4. Open `test-store.html` in browser → Click "Live Shop" button
5. Back in dashboard, you'll see the incoming call → Click "Join Call"

## Architecture

```
client/     → React dashboard + landing page
server/     → Express API + VideoSDK.live integration
server/sdk/ → Embeddable script for e-commerce sites
```

## Trial System
- Every new store gets 5 free customer calls
- After 5 calls, the SDK shows "Trial limit reached"
- Store owner can see usage in dashboard

## Tech Stack
- **Frontend**: React, React Router, VideoSDK React SDK
- **Backend**: Express, MongoDB, JWT auth
- **Video**: VideoSDK.live (cheapest, India-based, $20 free credit)
