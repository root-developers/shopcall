/* eslint-disable no-restricted-globals */

let ringInterval = null;

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'ShopCall', body: 'New notification' };

  // Show persistent notification with vibration
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [500, 200, 500, 200, 500, 200, 500],
      tag: 'shopcall-call',
      renotify: true,
      requireInteraction: true,
      silent: false,
      actions: [
        { action: 'accept', title: '✓ Accept' },
        { action: 'reject', title: '✗ Reject' },
      ],
      data: { url: data.url || '/dashboard', callId: data.callId, apiBase: data.apiBase },
    }).then(() => {
      // Re-vibrate every 3 seconds to simulate continuous ringing
      if (data.callId) {
        clearInterval(ringInterval);
        ringInterval = setInterval(() => {
          self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/logo192.png',
            badge: '/logo192.png',
            vibrate: [500, 200, 500, 200, 500],
            tag: 'shopcall-call', // same tag = replaces previous (no stacking)
            renotify: true,
            requireInteraction: true,
            silent: false,
            actions: [
              { action: 'accept', title: '✓ Accept' },
              { action: 'reject', title: '✗ Reject' },
            ],
            data: { url: data.url || '/dashboard', callId: data.callId, apiBase: data.apiBase },
          });
        }, 3000);

        // Auto-stop ringing after 60 seconds (call missed)
        setTimeout(() => {
          clearInterval(ringInterval);
          ringInterval = null;
        }, 60000);
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  // Stop ringing
  clearInterval(ringInterval);
  ringInterval = null;
  event.notification.close();

  const { url, callId, apiBase } = event.notification.data || {};

  if (event.action === 'reject' && callId && apiBase) {
    event.waitUntil(
      fetch(`${apiBase}/video/reject-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      })
    );
    return;
  }

  // Accept or click notification body → open/focus dashboard
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url || '/dashboard');
    })
  );
});

// Listen for messages from the app to stop ringing (when call accepted/rejected from dashboard)
self.addEventListener('message', (event) => {
  if (event.data === 'stop-ring') {
    clearInterval(ringInterval);
    ringInterval = null;
    self.registration.getNotifications({ tag: 'shopcall-call' }).then(notifications => {
      notifications.forEach(n => n.close());
    });
  }
});
