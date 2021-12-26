import { css } from "@emotion/css";
import React from "react";
import { useParams } from "react-router-dom";
import {
  useGetUsersInWaitingRoom,
  useUpdateUsersInWaitingRoom,
} from "../../api-hooks";
import UserWaitingCard from "./UserWaitingCard";

const styled = {
  root: css`
    display: flex;
    width: 100%;
    height: auto;
    max-height: 100%;
    overflow-y: auto;

    .waiting-list {
      width: 100%;

      display: grid;
      row-gap: 1.25rem;
      column-gap: 1.25rem;
      grid-template-columns: repeat(auto-fill, minmax(236px, max-content));
      justify-content: center;
    }
  `,
};

function WaitingRoom() {
  const { room_id } = useParams<{ room_id; menu }>();

  const { usersInWaitingRoom } = useGetUsersInWaitingRoom(room_id);
  const { mutateAsync } = useUpdateUsersInWaitingRoom();

  return (
    <div className={styled.root}>
      <div className="waiting-list">
        {usersInWaitingRoom.map(({ user_name, user_id }) => (
          <UserWaitingCard
            key={user_id}
            name={user_name}
            onAccept={() => {
              mutateAsync({ room_id, user_id, action: "accept" });
            }}
            onReject={() => {
              mutateAsync({ room_id, user_id, action: "reject" });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default WaitingRoom;
