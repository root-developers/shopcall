import { useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function usePush(token) {
  useEffect(() => {
    if (!token || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const res = await fetch(`${API}/push/vapid-key`);
        const { key } = await res.json();

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        });

        await fetch(`${API}/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ subscription }),
        });
      } catch (e) {
        console.log('Push setup failed:', e.message);
      }
    }

    setup();
  }, [token]);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
