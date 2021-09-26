import { useContext } from "react";
import { RoomContext } from "../components/Providers/RoomProvider";

export default function useRoom() {
  const { meState, ...resProps } = useContext(RoomContext);

  return resProps;
}
