import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0FyCOLcmvumfVo_Izro5-68zjWXr9qT8",
  authDomain: "mapa-adm-uniara.firebaseapp.com",
  projectId: "mapa-adm-uniara",
  storageBucket: "mapa-adm-uniara.firebasestorage.app",
  messagingSenderId: "78594989475",
  appId: "1:78594989475:web:91215cde349a2f57b68e16"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();