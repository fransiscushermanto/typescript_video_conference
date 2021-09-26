import { useContext } from "react";
import { RoomContext } from "../components/Providers/RoomProvider";

export default function useMe() {
  const { meState } = useContext(RoomContext);

  return meState;
}
