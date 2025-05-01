import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_YOUR_API_KEY,
  authDomain: import.meta.env.VITE_YOUR_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_YOUR_PROJECT_ID,
  storageBucket: import.meta.env.VITE_YOUR_BUCKET,
  messagingSenderId: import.meta.env.VITE_YOUR_MESSAGING_ID,
  appId: import.meta.env.VITE_YOUR_APP_ID,
  measurementId: import.meta.env.VITE_YOUR_MEASUREMENT_ID
};
console.log("Storage Bucket:", import.meta.env.VITE_YOUR_BUCKET);
console.log("All envs:", import.meta.env);



const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);