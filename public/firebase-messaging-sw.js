importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

// We need an apiKey to initialize the background service worker unfortunately.
const firebaseConfig = {
    apiKey: "AIzaSyBHM2daPsNo0kpC9R7EFYAJBtb891A64S8",
    authDomain: "nineteen06-93a59.firebaseapp.com",
    projectId: "nineteen06-93a59",
    storageBucket: "nineteen06-93a59.firebasestorage.app",
    messagingSenderId: "721727292895",
    appId: "1:721727292895:web:2d114e05f2eabd612df06a",
    measurementId: "G-CNPYPFPV2V"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log("[firebase-messaging-sw.js] Received background message ", payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/favicon.ico', // Update path if you have a logo
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (e) {
    console.error("Firebase Service Worker Initialization Failed. You probably need an API key.", e);
}
