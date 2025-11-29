
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
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Explicitly set the authDomain to fix redirect issues in specific environments.
auth.tenantId = null;
auth.languageCode = 'pt';
auth.settings.authDomain = firebaseConfig.authDomain;

const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});


export { app, auth, db, storage, googleProvider };
