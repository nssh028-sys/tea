import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Placeholder config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Note: In this environment, the set_up_firebase tool usually generates 
// firebase-applet-config.json. If the tool fails, please manually update 
// the firebaseConfig above with values from your Firebase Console.
const config = firebaseConfig;

const app = initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
