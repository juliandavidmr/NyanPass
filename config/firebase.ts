import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../firebase.config";

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);
const firebaseAnalytics =
	typeof window !== "undefined" ? getAnalytics(firebaseApp) : undefined;

export { firebaseAnalytics, firebaseApp, firebaseAuth, firebaseDb };
