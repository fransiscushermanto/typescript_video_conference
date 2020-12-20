import { useContext } from "react";
import { AuthContext } from "../components/Providers/AuthProvider";

export default function useAuth() {
  return useContext(AuthContext);
}
