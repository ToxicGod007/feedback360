// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace these with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyAAu6M02XMV1XSvXRWLB9TJeaI1P70xMEU",
    authDomain: "feedback360-c603a.firebaseapp.com",
    projectId: "feedback360-c603a",
    storageBucket: "feedback360-c603a.firebasestorage.app",
    messagingSenderId: "743823362595",
    appId: "1:743823362595:web:956689690f4bc9b5ea7f96"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);