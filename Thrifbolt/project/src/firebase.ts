// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr6GTZRlFOA7IHMmLuMnszuxlgeXphwag",
  authDomain: "thriftcart-ac1a1.firebaseapp.com",
  projectId: "thriftcart-ac1a1",
  storageBucket: "thriftcart-ac1a1.firebasestorage.app",
  messagingSenderId: "487590366084",
  appId: "1:487590366084:web:c4a44a0d381f731a272bd1",
  measurementId: "G-VLFG5JD96Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services you'll use in your app
export { app, analytics, auth, db };

// Note: In a production environment, consider using environment variables
// for your Firebase configuration instead of hardcoding the values.
