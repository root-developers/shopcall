import React, { useState, useEffect } from 'react';
import { API } from '../App';

const DEFAULT_DOCS = {
  title: 'SDK Integration Guide',
  subtitle: 'Add a floating Live Video Commerce widget to any store with a single line of JavaScript.',
  scriptSnippet: '<script \n  src="https://shopcall.store/sdk/shopcall-sdk.js" \n  data-store="YOUR_SDK_KEY">\n</script>'
};

export default function Docs({ dark, c }) {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('site_content');
      const data = cached ? JSON.parse(cached) : null;
      return data && data.docs ? { ...DEFAULT_DOCS, ...data.docs } : DEFAULT_DOCS;
    } catch {
      return DEFAULT_DOCS;
    }
  });

  useEffect(() => {
    document.title = 'SDK Integration Documentation | ShopCall';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Comprehensive developer and store integration guide for the ShopCall Live Video Commerce SDK. Add live calling button to custom stores, Shopify, and WooCommerce.');
    window.scrollTo(0, 0);

    fetch(`${API}/site`)
      .then(r => r.json())
      .then(d => {
        if (d && d.docs) {
          setContent({ ...DEFAULT_DOCS, ...d.docs });
          localStorage.setItem('site_content', JSON.stringify(d));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="lp-enter" style={{ maxWidth: 850, margin: '0 auto', padding: '60px 24px 100px', width: '100%' }}>
      <div style={{ borderBottom: `1px solid ${c.border}`, paddingBottom: 24, marginBottom: 40 }}>
        <span style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Developer Center</span>
        <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: 10, marginBottom: 8, letterSpacing: '-0.02em' }}>{content.title}</h1>
        <p style={{ fontSize: 16, color: c.muted }}>{content.subtitle}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }} className="docs-content">
        <section>
          <h2>1. Quick Start Integration</h2>
          <p>To add the floating "Live Shop" video commerce button to your storefront, simply copy and paste the following script block directly before the closing <code>&lt;/body&gt;</code> tag on your website pages:</p>
          
          <pre style={{ background: dark ? '#0c0c0e' : '#f4f4f6', border: `1px solid ${c.border}`, borderRadius: 10, padding: 20, overflowX: 'auto', fontSize: 14, color: dark ? '#f4f4f5' : '#18181b', marginTop: 12 }}>
            <code>{content.scriptSnippet}</code>
          </pre>
          <p style={{ marginTop: 10, fontSize: 13, color: c.muted }}>Note: Replace <code>YOUR_SDK_KEY</code> with the unique SDK key found in your ShopCall store dashboard panel.</p>
        </section>

        <section>
          <h2>2. Configuration Attributes</h2>
          <p>You can customize the appearance, text, and position of the widget by adding extra <code>data-*</code> attributes to the script tag:</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, marginBottom: 16, fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${c.border}`, textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Attribute</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Value Type</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Default</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                <td style={{ padding: '12px 8px' }}><code>data-store</code></td>
                <td style={{ padding: '12px 8px' }}>String</td>
                <td style={{ padding: '12px 8px' }}>—</td>
                <td style={{ padding: '12px 8px', color: c.muted }}>Required. Your store's ShopCall SDK key.</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                <td style={{ padding: '12px 8px' }}><code>data-color</code></td>
                <td style={{ padding: '12px 8px' }}>Hex Code</td>
                <td style={{ padding: '12px 8px' }}><code>#6366f1</code></td>
                <td style={{ padding: '12px 8px', color: c.muted }}>Changes the background color of the widget.</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                <td style={{ padding: '12px 8px' }}><code>data-position</code></td>
                <td style={{ padding: '12px 8px' }}>left | right</td>
                <td style={{ padding: '12px 8px' }}><code>right</code></td>
                <td style={{ padding: '12px 8px', color: c.muted }}>Aligns the button to the bottom-left or bottom-right corner.</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                <td style={{ padding: '12px 8px' }}><code>data-text</code></td>
                <td style={{ padding: '12px 8px' }}>String</td>
                <td style={{ padding: '12px 8px' }}><code>Live Shop</code></td>
                <td style={{ padding: '12px 8px', color: c.muted }}>The text displayed on the floating button.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>3. Shopify Integration Steps</h2>
          <p>For Shopify stores, follow these steps to place the widget:</p>
          <ol style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <li>Log in to your <strong>Shopify Admin Panel</strong>.</li>
            <li>Navigate to <strong>Online Store</strong> &gt; <strong>Themes</strong>.</li>
            <li>Click the **Actions** (...) button next to your active theme and select <strong>Edit Code</strong>.</li>
            <li>Locate the <strong>layout/theme.liquid</strong> file.</li>
            <li>Scroll to the bottom of the file, and paste your ShopCall script tag just above the closing <code>&lt;/body&gt;</code> tag.</li>
            <li>Click <strong>Save</strong>. The button is now live!</li>
          </ol>
        </section>

        <section>
          <h2>4. WooCommerce Integration Steps</h2>
          <p>For WordPress/WooCommerce websites, you can insert the script using custom hooks or inserting it in the footer template file:</p>
          <pre style={{ background: dark ? '#0c0c0e' : '#f4f4f6', border: `1px solid ${c.border}`, borderRadius: 10, padding: 20, overflowX: 'auto', fontSize: 13, color: dark ? '#f4f4f5' : '#18181b', marginTop: 12 }}>
{`// Add this code to your theme's functions.php file:
add_action('wp_footer', 'add_shopcall_sdk');
function add_shopcall_sdk() {
    ?>
    <script 
        src="https://shopcall.store/sdk/shopcall-sdk.js" 
        data-store="YOUR_SDK_KEY">
    </script>
    <?php
}`}
          </pre>
        </section>
      </div>

      <style>{`
        .docs-content h2 { font-size: 20px; font-weight: 700; color: ${c.text}; margin-bottom: 12px; margin-top: 24px; border-bottom: 1px solid ${c.border}; padding-bottom: 8px; }
        .docs-content p { font-size: 15px; color: ${c.muted}; lineHeight: 1.6; margin-bottom: 16px; }
        .docs-content code { background: ${dark ? '#1a1a1f' : '#f0f0f4'}; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: Courier, monospace; }
        .docs-content ol { color: ${c.muted}; font-size: 15px; margin-bottom: 20px; }
      `}</style>
    </div>
  );
}
