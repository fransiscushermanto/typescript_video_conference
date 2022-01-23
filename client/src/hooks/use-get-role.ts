import { useMemo } from "react";
import { useMe } from ".";
import { useGetRoomParticipants } from "../components/api-hooks";

export default function useGetRole() {
  const [me] = useMe();
  const { participants } = useGetRoomParticipants();

  return useMemo(
    () =>
      participants?.find((participant) => participant.user_id === me.user_id)
        ?.role,
    [participants, me.user_id],
  );
}
