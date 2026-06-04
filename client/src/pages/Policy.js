import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const POLICIES = {
  '/privacy': {
    title: 'Privacy Policy',
    lastUpdated: 'June 01, 2026',
    desc: 'How ShopCall collects, stores, and protects customer and merchant video/chat metadata.',
    content: `
      <h2>1. Information We Collect</h2>
      <p>ShopCall Technologies Pvt. Ltd. ("ShopCall", "we", "us") operates the live video commerce widget and merchant dashboards. We collect metadata necessary to initiate, route, and stabilize video calling connections between shoppers and store agents. This includes client IP address, device specs, browser types, agent name, shopper name, and phone numbers captured for callback routing.</p>

      <h2>2. Video & Audio Data Encryption</h2>
      <p>All video and audio streaming feeds are end-to-end encrypted (E2EE) in transit using WebRTC protocols. <strong>ShopCall does not record, intercept, or store any audio or video stream contents on our servers.</strong> The media stream is transmitted directly between shopper and agent peer-to-peer or via secured media routers (VideoSDK) and discarded immediately.</p>

      <h2>3. Text Chat History</h2>
      <p>In-call text chat messages are saved securely in our databases to provide merchants with historical customer conversation context. Merchants can access and purge their customer chat history at any time through their administrative dashboard panels.</p>

      <h2>4. Data Retention</h2>
      <p>Lead contact information (shopper names and phone numbers) is stored indefinitely for the sole purpose of allowing merchants to contact their customers. We will never sell, lease, or rent customer lead information to third parties.</p>
    `
  },
  '/terms': {
    title: 'Terms of Service',
    lastUpdated: 'June 01, 2026',
    desc: 'Governing terms and agreement details for merchants integrating the ShopCall widget.',
    content: `
      <h2>1. Acceptance of Terms</h2>
      <p>By registering a store account or integrating the ShopCall SDK script onto any website, you agree to comply with and be bound by these Terms of Service. If you do not agree, please remove the script and delete your account.</p>

      <h2>2. License Grant</h2>
      <p>We grant merchants a non-exclusive, non-transferable, revocable license to embed the ShopCall floating widget code on their registered domain name for video calling operations. Unauthorized distribution of SDK keys or source code modifications is strictly prohibited.</p>

      <h2>3. Billing and Subscriptions</h2>
      <p>Merchants select plans based on call limits and agent seats. Plan charges are billed monthly. Excess call volume might cause the widget to show "limit reached" warnings unless an account upgrade is verified by our admins. Plan fees are non-refundable.</p>

      <h2>4. Prohibited Content & Behavior</h2>
      <p>Merchants are strictly prohibited from using the video call service to showcase illegal products, transmit explicit materials, or violate any consumer protection laws. Violation will result in immediate termination of SDK functionality and account deletion.</p>
    `
  },
  '/refund': {
    title: 'Cancellation & Refund Policy',
    lastUpdated: 'June 01, 2026',
    desc: 'Rules regarding subscription cancellation, trial limits, and manual payment verification.',
    content: `
      <h2>1. Cancellations</h2>
      <p>Merchants can cancel their subscription plans at any time directly through the Store Dashboard settings panel. Upon cancellation, the current plan remains active until the end of the billing cycle, after which the store is automatically downgraded to the Free Trial tier.</p>

      <h2>2. Refunds</h2>
      <p>ShopCall subscription plans are subject to pre-purchase trials (5 free calls). Since our service has a free evaluation tier, <strong>all purchases, upgrades, and renewals are final and non-refundable</strong>.</p>

      <h2>3. Manual Payments</h2>
      <p>For manual bank transfers or payments reported through the billing dashboard, plan activation depends on admin verification. If an admin rejects a reported payment because no matching transfer is identified, the request will be marked failed. No plan upgrades will occur until valid payment validation is achieved.</p>
    `
  },
  '/shipping': {
    title: 'Shipping Policy & Integration SLA',
    lastUpdated: 'June 01, 2026',
    desc: 'Information regarding digital code delivery, API setup SLA, and server availability.',
    content: `
      <h2>1. Digital Delivery of SDK Key</h2>
      <p>ShopCall is a software-as-a-service (SaaS) utility. No physical shipping is involved. Your SDK key and setup instructions are delivered instantly to your store dashboard screen and registered email address immediately upon account verification.</p>

      <h2>2. Technical Support SLA</h2>
      <p>We target 99.9% uptime for our video signaling servers. For Pro plan customers, support tickets are addressed within a 12-hour window. Starter plan queries are addressed within 24 hours.</p>

      <h2>3. Third-party Code Conflicts</h2>
      <p>While the ShopCall script runs seamlessly alongside modern Javascript structures, we are not liable for performance drop-offs or styling overlaps caused by conflicting scripts on the merchant's hosting environment.</p>
    `
  },
  '/grievance': {
    title: 'Grievance Redressal',
    lastUpdated: 'June 01, 2026',
    desc: 'Contact details of our designated grievance officer under Indian Consumer Protection rules.',
    content: `
      <p>In accordance with the Indian Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, we have appointed a Grievance Officer to address merchant and consumer concerns.</p>

      <h2>Grievance Officer Details</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px;">
        <tbody>
          <tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
            <td style="padding: 12px 0; font-weight: 600; width: 150px;">Name:</td>
            <td style="padding: 12px 0;">Mr. Amit Kumar Sen</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
            <td style="padding: 12px 0; font-weight: 600;">Designation:</td>
            <td style="padding: 12px 0;">Nodal Officer & Head of Compliance</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
            <td style="padding: 12px 0; font-weight: 600;">Address:</td>
            <td style="padding: 12px 0;">ShopCall Technologies Pvt. Ltd., 9th Floor, Tech Hub Sector V, Kolkata, WB 700091</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
            <td style="padding: 12px 0; font-weight: 600;">Email:</td>
            <td style="padding: 12px 0;"><a href="mailto:nodal@shopcall.store" style="color: #6366f1; text-decoration: none;">nodal@shopcall.store</a></td>
          </tr>
        </tbody>
      </table>

      <h2>Resolution Timeline</h2>
      <p>Grievances received will be acknowledged within 48 hours of receipt. We aim to investigate and provide a full resolution to complaints within 15 working days, depending on the complexity of the query.</p>
    `
  }
};

export default function Policy({ dark, c }) {
  const location = useLocation();
  const policy = POLICIES[location.pathname] || POLICIES['/privacy'];

  useEffect(() => {
    document.title = `${policy.title} | ShopCall`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', policy.desc);
    window.scrollTo(0, 0);
  }, [location.pathname, policy]);

  return (
    <div className="lp-enter" style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 100px', width: '100%' }}>
      <div style={{ borderBottom: `1px solid ${c.border}`, paddingBottom: 24, marginBottom: 40 }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{policy.title}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: c.muted, fontSize: 13 }}>
          <span>ShopCall Technologies Private Limited</span>
          <span>Last Updated: {policy.lastUpdated}</span>
        </div>
      </div>

      <div 
        className="policy-content"
        style={{ fontSize: 15, lineHeight: 1.8, color: dark ? '#d4d4d8' : '#3f3f46' }}
        dangerouslySetInnerHTML={{ __html: policy.content }}
      />

      <style>{`
        .policy-content h2 { font-size: 18px; font-weight: 700; color: ${c.text}; margin-top: 30px; margin-bottom: 10px; }
        .policy-content p { margin-bottom: 16px; }
        .policy-content ul { margin-left: 20px; margin-bottom: 16px; }
        .policy-content li { margin-bottom: 6px; }
        .policy-content strong { color: ${c.text}; }
      `}</style>
    </div>
  );
}
