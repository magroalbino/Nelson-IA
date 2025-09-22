import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-4035352308-356c4",
  "appId": "1:1042271216005:web:6659978808d3c7f65a24ec",
  "apiKey": "AIzaSyAHLPmFIdOBtEbBuyn9J7x_sA_w8dPBdX0",
  "authDomain": "studio-4035352308-356c4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1042271216005"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, storage, auth, googleProvider };
