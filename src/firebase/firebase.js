import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9xNshDnFsfTYUWZid3erqsFnGz57wv5c",
  authDomain: "jobshield-ai-1a651.firebaseapp.com",
  projectId: "jobshield-ai-1a651",
  storageBucket: "jobshield-ai-1a651.firebasestorage.app",
  messagingSenderId: "506272108929",
  appId: "1:506272108929:web:2a577d83af9361d8bc1880",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
