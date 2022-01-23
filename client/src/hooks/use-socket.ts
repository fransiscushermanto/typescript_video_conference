import { useContext } from "react";
import { SocketContext } from "../components/Providers/SocketProvider";

export default function useSocket() {
  return useContext(SocketContext);
}
