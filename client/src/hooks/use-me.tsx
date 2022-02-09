import { useContext } from "react";
import { AuthContext } from "../components/Providers/AuthProvider";

export default function useMe() {
  const { meState } = useContext(AuthContext);

  return meState;
}
