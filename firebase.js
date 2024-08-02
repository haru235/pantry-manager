// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh0jN2pbnBFdMB9E5Fiso_d3MFXhC9uZo",
  authDomain: "pantryapp-d566f.firebaseapp.com",
  projectId: "pantryapp-d566f",
  storageBucket: "pantryapp-d566f.appspot.com",
  messagingSenderId: "834343713025",
  appId: "1:834343713025:web:3ee5a15e5bd07c50b88300",
  measurementId: "G-F3SQZJLTXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Analytics (only if supported and in the client environment)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((error) => {
    console.error('Analytics initialization failed:', error);
  });
}

export { app, firestore, analytics };
