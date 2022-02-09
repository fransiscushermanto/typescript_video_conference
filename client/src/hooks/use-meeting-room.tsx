import { useContext } from "react";
import { MeetingRoomContext } from "../components/Providers/MeetingRoomProvider";

export default function useMeetingRoom() {
  return useContext(MeetingRoomContext);
}
