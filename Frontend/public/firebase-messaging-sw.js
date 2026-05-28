/*
  Service Worker para Firebase Cloud Messaging (background notifications).
  La configuración se genera desde `Frontend/public/firebase-config.js`.
*/

importScripts('/firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = self.__FIREBASE_CONFIG || null;

if (firebaseConfig?.apiKey) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function(payload) {
    const type = String(payload?.data?.type || 'sistema').toLowerCase();
    const sourceTitle = String(payload.notification?.title || payload?.data?.title || '').trim();
    const sourceBody = String(payload.notification?.body || payload?.data?.body || '').trim();
    const title = type === 'sistema' ? 'Notificación de Sistema' : sourceTitle || 'Notificación';
    const body = type === 'sistema'
      ? [sourceTitle, sourceBody].filter(Boolean).join('\n')
      : sourceBody;
    const options = {
      body,
      icon: payload.notification?.icon || '/icons/icon-192.png',
      tag: String(payload?.data?.notificationId || payload?.data?.id_notificacion || payload?.data?.id || sourceTitle || 'notification'),
      renotify: false,
      data: payload.data || {}
    };

    self.registration.showNotification(title, options);
  });
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then(windowClients => {
    for (let client of windowClients) {
      if (client.url === url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
