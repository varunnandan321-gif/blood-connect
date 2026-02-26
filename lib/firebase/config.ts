// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIFmyoaP6BFhFWEF-HwTOPm8PC-bqAaXM",
  authDomain: "blood-connect-6b59f.firebaseapp.com",
  projectId: "blood-connect-6b59f",
  storageBucket: "blood-connect-6b59f.firebasestorage.app",
  messagingSenderId: "50185170828",
  appId: "1:50185170828:web:622aea2a9f57015f7cf0a9"
};

// Initialize Firebase securely (prevent re-initializing in Next.js development)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };