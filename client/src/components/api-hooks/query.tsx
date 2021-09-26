import { useQuery, UseQueryOptions } from "react-query";
import axios from "../../axios-instance";

enum ParticipantType {
  HOST = "host",
  CO_HOST = "co-host",
  PARTICIPANT = "participant",
}

interface Participants {
  user_id: string;
  status: ParticipantType;
  user_name: string;
}

export function useGetRooms(
  user_id: string,
  options: UseQueryOptions<
    {
      room_host: string;
      room_id: string;
      room_name: string;
      room_password: string;
    }[],
    any
  > = {},
) {
  return useQuery<
    {
      room_host: string;
      room_id: string;
      room_name: string;
      room_password: string;
    }[],
    any
  >(
    "rooms",
    async () => {
      const res = await axios.get("/api/getRooms", {
        params: {
          user_id: user_id,
        },
      });
      return res.data.rooms;
    },
    options,
  );
}

export function useGetRoomParticipants(
  { user_id, room_id }: { user_id: string; room_id: string },
  options: UseQueryOptions<Participants[], any> = {},
) {
  return useQuery<Participants[], any>("room-participants", async () => {
    const res = await axios.get("/api/getRoomParticipants", {
      params: {
        user_id,
        room_id,
      },
    });
    return res.data.participants;
  });
}
