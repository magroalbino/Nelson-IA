import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

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
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);
googleProvider = new GoogleAuthProvider();


export { app, db, storage, auth, googleProvider };
