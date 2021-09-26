import * as firebase from "firebase/app";
import Cookies from "js-cookie";
import "firebase/storage";
import { getFirestore, addDoc } from "firebase/firestore";
import "firebase/database";
import {
  getAuth,
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
// Your web app's Firebase configuration
var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const provider: GoogleAuthProvider = new GoogleAuthProvider();

class Firebase {
  app: firebase.FirebaseApp;
  auth: Auth;
  db: any;
  storage: any;
  firestore: any;

  constructor() {
    // Initialize Firebase
    this.app = firebase.initializeApp(config);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }

  async login() {
    try {
      const res = await signInWithPopup(this.auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(res);
      const token = credential.accessToken;
      const user = res.user;
      Cookies.set("Authorization", token);
      return user.toJSON();
    } catch (error) {
      console.log(error);
    }
  }

  logout() {
    Cookies.remove("Authorization");
    return this.auth.signOut();
  }
}

export default Firebase;
