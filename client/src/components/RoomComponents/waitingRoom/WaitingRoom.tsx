import React from "react";
import { useParams } from "react-router-dom";
import { useGetUsersInWaitingRoom } from "../../api-hooks";

function WaitingRoom() {
  const { room_id } = useParams<{ room_id; menu }>();

  const { usersInWaitingRoom } = useGetUsersInWaitingRoom(room_id);

  return (
    <div>
      {usersInWaitingRoom.map(({ user_id, user_name, status }) => (
        <div>
          <div>{user_id}</div>
          <div>{user_name}</div>
          <div>{status}</div>
        </div>
      ))}
    </div>
  );
}

export default WaitingRoom;
