import { useMutation, UseMutationOptions } from "react-query";
import axios from "../../axios-instance";

export function useCheckRoom(
  options: UseMutationOptions<any, any, { room_id }> = {},
) {
  return useMutation<any, any, { room_id }>(
    "rooms",
    async ({ room_id }) => {
      const res = await axios.post("/api/checkRoom", {
        room_id,
      });
      return res.data;
    },
    options,
  );
}
