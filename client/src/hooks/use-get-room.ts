import { useEffect } from "react";
import { useGetRooms } from "../components/api-hooks";
import { RoomModel } from "../components/api-hooks/type";

export default function useGetRoom(room_id: string) {
  const { rooms, refetch } = useGetRooms();

  useEffect(() => {
    refetch();
  }, []);

  return rooms?.find((room) => room.room_id === room_id) || ({} as RoomModel);
}
