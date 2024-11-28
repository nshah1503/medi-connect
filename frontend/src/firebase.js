// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyD0m5k7H46-Hv0guud2sUAwbOBTKdQJ0Uc",
  authDomain: "doctalk-9e28b.firebaseapp.com",
  // databaseURL: "https://doctalk-9e28b-default-rtdb.firebaseio.com",
  databaseURL: "https://mediconnect.firebaseio.com",
  projectId: "doctalk-9e28b",
  storageBucket: "doctalk-9e28b.appspot.com",
  messagingSenderId: "563035266383",
  appId: "1:563035266383:web:1b02a0823fba16895bb93a",
  measurementId: "G-L7GHKGZW2M",
};

// Replace the placeholder values above with your actual Firebase configuration

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
