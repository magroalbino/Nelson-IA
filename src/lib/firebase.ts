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
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

function getAuthInstance() {
    if (!auth) {
        auth = getAuth(app);
    }
    return auth;
}

function getDbInstance() {
    if (!db) {
        db = getFirestore(app);
    }
    return db;
}

function getStorageInstance() {
    if (!storage) {
        storage = getStorage(app);
    }
    return storage;
}

function getGoogleProvider() {
    if(!googleProvider) {
        googleProvider = new GoogleAuthProvider();
    }
    return googleProvider;
}

export { app, getAuthInstance, getDbInstance, getStorageInstance, getGoogleProvider, googleProvider };
