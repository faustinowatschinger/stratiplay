// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4sORNT7xao_xF-SBcN9KnAQKK2TukZpY",
  authDomain: "ordo-62889.firebaseapp.com",
  projectId: "ordo-62889",
  storageBucket: "ordo-62889.firebasestorage.app",
  messagingSenderId: "318423788674",
  appId: "1:318423788674:web:a401048f9a3157bc22989b",
  measurementId: "G-53TR0VGZ3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export the instances with named exports
export { app, auth, db };
