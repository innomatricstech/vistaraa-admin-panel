// firebase.js

// Firebase Core
import { initializeApp, getApps, getApp } from "firebase/app";

// Firestore
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

// Storage
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBx29cqqA9QsVEE-dkY7hfsLcK5wNyz368",
  authDomain: "vistaraa-application.firebaseapp.com",
  projectId: "vistaraa-application",
  storageBucket: "vistaraa-application.firebasestorage.app",
  messagingSenderId: "522139543180",
  appId: "1:522139543180:web:19c09e16f6cc030d07bda9",
  measurementId: "G-2XWRMLV51C"
};

// Prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore instance
export const db = getFirestore(app);

// Storage instance
export const storage = getStorage(app, "gs://vistaraa-application.firebasestorage.app");

// Export Storage utilities
export { ref, uploadBytes, getDownloadURL };

// Export Firestore utilities
export {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy
};

// Export default app
export default app;
