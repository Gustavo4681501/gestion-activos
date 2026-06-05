import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDYCgjO5DIlrNWn4pWOOommYLU7-mMcIqw",
  authDomain: "porceramica-it-assets.firebaseapp.com",
  projectId: "porceramica-it-assets",
  storageBucket: "porceramica-it-assets.firebasestorage.app",
  messagingSenderId: "608311853786",
  appId: "1:608311853786:web:86daeaf71aa3df88509be3",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
