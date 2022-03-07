import { useMemo } from "react";
import { useMe } from ".";
import { useGetRoomParticipants } from "../components/api-hooks";

export default function useGetRole() {
  const [me] = useMe();
  const { participants, isFetching } = useGetRoomParticipants();

  return useMemo(
    () => ({
      role: participants?.find(
        (participant) => participant.user_id === me.user_id,
      )?.role,
      isLoading: isFetching,
    }),
    [participants, isFetching, me.user_id],
  );
}
