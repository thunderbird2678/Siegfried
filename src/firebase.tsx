// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const FIREBASE_CONFIG = {
  authDomain: "photos-thunderbird-site.firebaseapp.com",
  projectId: "photos-thunderbird-site",
  storageBucket: "photos-thunderbird-site.appspot.com",
  messagingSenderId: "303025008769",
  appId: "1:303025008769:web:5510f6f6ad60594c7c1d80",
  measurementId: "G-9HPJZBMX8F",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(FIREBASE_CONFIG);
