import { useContext } from "react";
import { FirebaseContext } from "../components/Providers/FirebaseProvider";
import Firebase from "../firebase/config";

export default function useFirebase(): Firebase {
  return useContext(FirebaseContext);
}
