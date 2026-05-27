/* eslint-disable no-restricted-globals */

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'ShopCall', body: 'New notification' };

  // Long vibration pattern that simulates continuous ringing (up to 30 seconds)
  const ringPattern = [];
  for (let i = 0; i < 30; i++) {
    ringPattern.push(400, 200, 400, 600);
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: ringPattern,
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
      // Message all open clients to start ringtone audio
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => client.postMessage('start-ring'));
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
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

// Stop ring when app sends message
self.addEventListener('message', (event) => {
  if (event.data === 'stop-ring') {
    self.registration.getNotifications({ tag: 'shopcall-call' }).then(notifications => {
      notifications.forEach(n => n.close());
    });
  }
});
