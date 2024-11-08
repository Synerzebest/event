import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyComLllQTQLz2gWRPH_S9-fdRF-gvSXTEQ",
    authDomain: "eventease-fd5ce.firebaseapp.com",
    projectId: "eventease-fd5ce",
    storageBucket: "eventease-fd5ce.appspot.com",
    messagingSenderId: "97995346547",
    appId: "1:97995346547:web:0c791063934bcaf8a71006",
    measurementId: "G-BCW6T1CMLM"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only in client-side environment
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { db, storage, analytics, auth, googleProvider };