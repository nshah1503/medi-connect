import { initializeApp } from "firebase/app";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0m5k7H46-Hv0guud2sUAwbOBTKdQJ0Uc",
  authDomain: "doctalk-9e28b.firebaseapp.com",
  databaseURL: "https://doctalk-9e28b-default-rtdb.firebaseio.com",
  projectId: "doctalk-9e28b",
  storageBucket: "doctalk-9e28b.appspot.com",
  messagingSenderId: "563035266383",
  appId: "1:563035266383:web:1b02a0823fba16895bb93a",
  measurementId: "G-L7GHKGZW2M"
};

const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;