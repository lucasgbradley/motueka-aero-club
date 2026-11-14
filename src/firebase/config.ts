import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Motueka Aero Club
export const firebaseConfig = {
  apiKey: "AIzaSyBTnN7_I7j1VcU-5FDIA9CbpISd29Yeqd0",
  authDomain: "motueka-aero.firebaseapp.com",
  projectId: "motueka-aero",
  storageBucket: "motueka-aero.firebasestorage.app",
  messagingSenderId: "193902400352",
  appId: "1:193902400352:web:42f52e16da959f52164405",
  measurementId: "G-1030X9VXKJ"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export Authentication and Firestore database
export const auth = getAuth(app);
export const db = getFirestore(app);
