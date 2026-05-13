import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCFNZB5SBj2QoBJ6qF_pTkfAC3rVymEahM",
  authDomain: "queuesystem-80e06.firebaseapp.com",
  databaseURL: "https://queuesystem-80e06-default-rtdb.firebaseio.com",
  projectId: "queuesystem-80e06",
  storageBucket: "queuesystem-80e06.firebasestorage.app",
  messagingSenderId: "30275507505",
  appId: "1:30275507505:web:d00cc742ed42bb6f370c10",
  measurementId: "G-54G6CL3L5Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);