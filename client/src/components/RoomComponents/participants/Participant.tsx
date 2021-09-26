import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useMe } from "../../../hooks";
import { useGetRoomParticipants } from "../../api-hooks";

function Participant() {
  const [me] = useMe();
  const { room_id } = useParams<{ room_id }>();
  const { data: participants } = useGetRoomParticipants(
    {
      user_id: me.user_id,
      room_id,
    },
    {
      enabled: !!(me && me.user_id),
    },
  );

  // useEffect(() => {}, [])

  return (
    <div style={{ color: "white" }}>
      {participants &&
        participants.map(({ status, user_id, user_name }) => (
          <div>
            <div>{status}</div>
            <div>{user_id}</div>
            <div>{user_name}</div>
          </div>
        ))}
    </div>
  );
}

export default Participant;
