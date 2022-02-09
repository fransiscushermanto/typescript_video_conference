import { useContext } from "react";
import { RoomSocketContext } from "../components/Providers/RoomSocketProvider";

export default function useRoomSocket() {
  return useContext(RoomSocketContext);
}
