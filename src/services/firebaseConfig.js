import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlE1tasKNiaMJ-tMOt5xEy6xxlJ2TwZ5E",
  authDomain: "filmes-28d1f.firebaseapp.com",
  projectId: "filmes-28d1f",
  storageBucket: "filmes-28d1f.appspot.com",
  messagingSenderId: "996610183313",
  appId: "1:996610183313:web:74b252fcf504753da52f30",
  measurementId: "G-X902F5RPVH"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)