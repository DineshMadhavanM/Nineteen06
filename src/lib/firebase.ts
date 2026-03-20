import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { apiUrl } from "./api"; // Ensure you have this

const firebaseConfig = {
    apiKey: "AIzaSyBHM2daPsNo0kpC9R7EFYAJBtb891A64S8",
    authDomain: "nineteen06-93a59.firebaseapp.com",
    projectId: "nineteen06-93a59",
    storageBucket: "nineteen06-93a59.firebasestorage.app",
    messagingSenderId: "721727292895",
    appId: "1:721727292895:web:2d114e05f2eabd612df06a",
    measurementId: "G-CNPYPFPV2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getAuth, GoogleAuthProvider } from "firebase/auth";
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export const VAPID_KEY = "BF24RE_XY4CfZW_PoSHaoNcQ-l9kkTjtMOdMcQR0PbF3NE6HelC6RVWsnHMct979fS-HnW88dV-rL5tn3ykBx9w";

export const requestFirebaseNotificationPermission = async () => {
    try {
        console.log("FCM: Requesting notification permission...");
        const permission = await Notification.requestPermission();
        console.log("FCM: Permission status:", permission);

        if (permission === "granted") {
            console.log("FCM: Registering service worker explicitly...");
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log("FCM: Service worker registered successfully.");

            console.log("FCM: Attempting to get registration token...");
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log("FCM: Registration token generated:", token);
                await sendTokenToServer(token);
                return token;
            } else {
                console.warn("FCM: No registration token available.");
            }
        } else {
            console.warn("FCM: Permission not granted for notifications.");
        }
    } catch (error) {
        console.error("FCM: An error occurred during the notification setup process:", error);
    }
};

const sendTokenToServer = async (fcmToken: string) => {
    try {
        const authToken = localStorage.getItem('token');
        if (!authToken) {
            console.warn("FCM: No auth token found in local storage, skipping server registration.");
            return;
        }

        console.log("FCM: Sending token to server...");
        const response = await fetch(apiUrl('/api/auth/fcm-token'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify({ fcmToken })
        });

        if (response.ok) {
            console.log("FCM: Token successfully saved to server.");
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("FCM: Server rejected token registration:", response.status, errorData);
        }
    } catch (err) {
        console.error("FCM: Failed to save token to server due to network error:", err);
    }
};
