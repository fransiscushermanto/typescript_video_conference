import { useContext } from "react";
import { RoomContext } from "../components/Providers/RoomProvider";

export default function useRoom() {
  return useContext(RoomContext);
}
