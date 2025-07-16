// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "Yxw9bGIf2r8qk0MIhXYXU9VczdJo8jvJ1aYlARW2",
  //authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://mobil-2b41f-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "mobil-2b41f",
  storageBucket: "mobil-2b41f.firebasestorage.app",
  //messagingSenderId: "SENDER_ID",
  appId: "1:1018558592650:android:f863a5e2a3812e1c089f73"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
