/*
  Service Worker para Firebase Cloud Messaging (background notifications).
  Reemplaza `firebaseConfig` con la configuración de tu proyecto.
  Para usar: coloca este archivo en `Frontend/public/firebase-messaging-sw.js`.
*/

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// TODO: reemplaza con tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCdkF2YTAAGC-QQPbpA_1NO2U04WCG4dLU",
  authDomain: "db-omj.firebaseapp.com",
  projectId: "db-omj",
  storageBucket: "db-omj.firebasestorage.app",
  messagingSenderId: "610370458234",
  appId: "1:610370458234:web:662e0f429915ee96b8e1c3",
  measurementId: "G-DH68ZHC0FJ"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || payload?.data?.title || 'Notificación';
  const options = {
    body: payload.notification?.body || payload?.data?.body || '',
    icon: payload.notification?.icon || '/icons/icon-192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});

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
