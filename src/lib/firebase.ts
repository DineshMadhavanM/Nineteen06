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
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
            });
            if (token) {
                console.log("FCM Token generated:", token);
                // Send this token to the backend
                await sendTokenToServer(token);
                return token;
            } else {
                console.log("No registration token available. Request permission to generate one.");
            }
        } else {
            console.log("Do not have permission for notifications.");
        }
    } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
    }
};

const sendTokenToServer = async (fcmToken: string) => {
    try {
        const authToken = localStorage.getItem('token');
        if (!authToken) return;

        await fetch(apiUrl('/api/auth/fcm-token'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify({ fcmToken })
        });
        console.log("FCM Token saved to server.");
    } catch (err) {
        console.error("Failed to save FCM token to server:", err);
    }
};
