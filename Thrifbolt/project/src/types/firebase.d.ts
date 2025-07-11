import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

declare module '../firebase' {
  const app: FirebaseApp;
  const auth: Auth;
  const db: Firestore;
  
  export { app, auth, db };
}
