// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB779preXOK_CdUH4GIpkqbM4xvEsOvNjM",
  authDomain: "visitrak-f3a23.firebaseapp.com",
  projectId: "visitrak-f3a23",
  storageBucket: "visitrak-f3a23.firebasestorage.app",
  messagingSenderId: "363380028630",
  appId: "1:363380028630:web:e032d310c11bcb0cb98577"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
