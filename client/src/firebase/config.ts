import * as firebase from "firebase/app";
import Cookies from "js-cookie";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import {
  getFirestore,
  addDoc,
  collection,
  Firestore,
  doc,
  getDoc,
  onSnapshot,
  getDocs,
  DocumentSnapshot,
  DocumentData,
  query,
  onSnapshotsInSync,
  FirestoreError,
  QuerySnapshot,
} from "firebase/firestore";
import "firebase/database";
import {
  getAuth,
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { Collections } from "./collections";
// Your web app's Firebase configuration
var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export interface IFirestoreOnSnapshotArguments {
  next?: (snapshot: QuerySnapshot<DocumentData>) => void;
  error?: (error: FirestoreError) => void;
  complete?: () => void;
}

const provider: GoogleAuthProvider = new GoogleAuthProvider();

class Firebase {
  app: firebase.FirebaseApp;
  auth: Auth;
  db: any;
  storage: any;
  firestore: Firestore;

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

  getRoomParticipants(observer?: IFirestoreOnSnapshotArguments) {
    return onSnapshot(
      query(collection(this.firestore, Collections.rooms)),
      observer,
    );
  }

  getRoomMeetings(room_id, observer?: IFirestoreOnSnapshotArguments) {
    return onSnapshot(
      query(
        collection(
          this.firestore,
          `${Collections.rooms}/${room_id}/${Collections.room_meetings}`,
        ),
      ),
      observer,
    );
  }

  async uploadFileToStorage(file: File, path: string) {
    const storage = getStorage();

    const fullPathFileRef = ref(storage, `${path}/${file.name}`);
    return await uploadBytes(fullPathFileRef, file);
  }

  async getFileFromStorage(path) {
    const storage = getStorage();

    return await getDownloadURL(ref(storage, path));
  }

  async getRoom(room_id: string) {
    try {
      const docRef = doc(this.firestore, Collections.rooms, room_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return {};
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default Firebase;
