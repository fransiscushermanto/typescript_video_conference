import { css } from "@emotion/css";
import React from "react";
import { useHistory } from "react-router";

interface IRoomCard {
  room: {
    room_host: string;
    room_id: string;
    room_name: string;
    room_password: string;
  };
}

const styled = {
  card: css`
    cursor: pointer;
    width: 300px;
    height: 300px;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    .initial {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 90px;
      height: 90px;
      clip-path: circle();
      font-size: 50px;
      font-weight: 600;

      pointer-events: none;
      user-select: none;
      margin-bottom: 1.25rem;
      color: white;
    }
    .name {
      font-size: 2.125rem;
      font-weight: 600;
      text-align: center;
    }
  `,
};

function RoomCard({ room }: IRoomCard) {
  const { room_name, room_id } = room;
  const history = useHistory();

  function getInitialRoomName() {
    const arrStr = String(room_name).split(" ");
    if (arrStr.length > 1) {
      return (
        arrStr[0].substr(0, 1).toUpperCase() +
        arrStr[1].substr(0, 1).toUpperCase()
      );
    } else {
      return arrStr[0].substr(0, 1).toUpperCase();
    }
  }

  function getRandomColor() {
    const color = ["#C6D57E", "#D57E7E", "#A2CDCD", "#FFE1AF"];

    return color[Math.floor(Math.random() * color.length)];
  }

  return (
    <div
      onClick={() => history.push(`/room/${room_id}`)}
      className={styled.card}
    >
      <div style={{ backgroundColor: getRandomColor() }} className="initial">
        <span>{getInitialRoomName()}</span>
      </div>
      <div className="name">
        <span>{room_name}</span>
      </div>
    </div>
  );
}

export default RoomCard;
