import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDnxJ78LLnPx4d05xcbax0FD9p-6Dx3xKg",
  authDomain: "smartpicture-ai.firebaseapp.com",
  projectId: "alert-autumn-467806-j3",
  storageBucket: "/alert-autumn-467806-j3.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

export const app = initializeApp(firebaseConfig);
