import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6VQ73KWH5mMvScFNgQ-5HVz6tBPmg3mI",
  authDomain: "sparta-65241.firebaseapp.com",
  projectId: "sparta-65241",
  storageBucket: "sparta-65241.firebasestorage.app",
  messagingSenderId: "288816784917",
  appId: "1:288816784917:web:7ead1b3d110991ad77d01c",
  measurementId: "G-BGKKBYS3C6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
