/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'ShopCall', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: 'shopcall-' + (data.callId || ''),
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'accept', title: '✓ Accept' },
        { action: 'reject', title: '✗ Reject' },
      ],
      data: { url: data.url || '/dashboard', callId: data.callId, apiBase: data.apiBase },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { url, callId, apiBase } = event.notification.data || {};

  if (event.action === 'reject' && callId && apiBase) {
    // Reject the call
    event.waitUntil(
      fetch(`${apiBase}/video/reject-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      })
    );
    return;
  }

  // Accept or click notification body → open dashboard
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/dashboard') && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url || '/dashboard');
    })
  );
});
