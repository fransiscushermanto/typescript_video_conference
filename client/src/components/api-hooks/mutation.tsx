import { useMutation, UseMutationOptions } from "react-query";
import axios from "../../axios-instance";

export function useCheckRoom(
  options: UseMutationOptions<any, any, { room_id }> = {},
) {
  return useMutation<any, any, { room_id }>(
    "check_room",
    async ({ room_id }) => {
      const res = await axios.post("/api/checkRoom", {
        room_id,
      });
      return res.data;
    },
    options,
  );
}

export function useJoinRoom(
  options: UseMutationOptions<
    any,
    any,
    { room_id: string; room_password: string; user_id: string }
  > = {},
) {
  return useMutation<
    any,
    any,
    { room_id: string; room_password: string; user_id: string }
  >(
    "join_room",
    async ({ room_id, room_password, user_id }) => {
      const res = await axios.post("/api/joinRoom", {
        room_id,
        room_password,
        user_id,
      });
      return res.data;
    },
    options,
  );
}
