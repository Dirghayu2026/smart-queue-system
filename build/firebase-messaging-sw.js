// Scripts for background messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your same Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCFNZB5SBj2QoBJ6qF_pTkfAC3rVymEahM",
  authDomain: "queuesystem-80e06.firebaseapp.com",
  projectId: "queuesystem-80e06",
  storageBucket: "queuesystem-80e06.firebasestorage.app",
  messagingSenderId: "30275507505",
  appId: "1:30275507505:web:d00cc742ed42bb6f370c10",
  measurementId: "G-54G6CL3L5Y"
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' // You can add your logo here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});