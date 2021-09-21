import { useQuery, UseQueryOptions } from "react-query";
import axios from "../../axios-instance";

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
