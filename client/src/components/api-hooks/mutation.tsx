import { useMutation, UseMutationOptions } from "react-query";
import axios from "../../axios-instance";

export function useCheckRoom(
  options: UseMutationOptions<any, any, { room_id }> = {},
) {
  return useMutation<any, any, { room_id }>(
    "check_room",
    async ({ room_id }) => {
      const res = await axios.post("/rooms/verify", {
        room_id,
      });
      return res.data;
    },
    options,
  );
}

export function useCreateRoom(
  options: UseMutationOptions<
    any,
    any,
    { room_name: string; user_id: string }
  > = {},
) {
  return useMutation<any, any, { room_name: string; user_id: string }>(
    "create_room",
    async (params) => {
      const res = await axios.post("/rooms/create", params);
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
      const res = await axios.post("/rooms/join", {
        room_id,
        room_password,
        user_id,
      });
      return res.data;
    },
    options,
  );
}

export function useUpdateUsersInWaitingRoom(
  options: UseMutationOptions<
    any,
    any,
    { room_id: string; user_id: string; action: "accept" | "reject" }
  > = {},
) {
  return useMutation<
    any,
    any,
    { room_id: string; user_id: string; action: "accept" | "reject" }
  >(
    "join_room",
    async ({ room_id, user_id, action }) => {
      const res = await axios.post(
        `/rooms/${room_id}/participants/waiting/${user_id}`,
        {
          action,
        },
      );
      return res.data;
    },
    options,
  );
}
