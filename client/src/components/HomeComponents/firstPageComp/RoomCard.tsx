import { css, cx } from "@emotion/css";
import React from "react";
import { useHistory } from "react-router";
import { ParticipantType, RoomStatus } from "../../api-hooks/type";
import KebabMenuSVG from "../../../assets/kebab-menu.svg";
import * as Popover from "@radix-ui/react-popover";
import { useDeleteRoom } from "./../../api-hooks/mutation";
import useMe from "./../../../hooks/use-me";
import { useGetRoomParticipants } from "../../api-hooks";

interface IRoomCard {
  room: {
    room_host: string;
    room_id: string;
    room_name: string;
    room_password: string;
    status: RoomStatus;
  };
}

const styled = {
  card: css`
    position: relative;
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

    &.disabled {
      opacity: 0.5;
      cursor: default;
    }

    .menu {
      position: absolute;
      top: 0;
      right: 0;

      padding: 0;
      margin-top: 0.625rem;
      margin-right: 0.625rem;

      background-color: transparent;
      border: none;
      .icon {
        transform: rotate(90deg);
      }
    }
  `,
  menuDropdown: css`
    background-color: white;
    left: 0;

    box-shadow: 0px 2px 4px 1px rgba(0, 0, 0, 0.3);
    .menu {
      cursor: pointer;
      user-select: none;
      padding: 0.5rem 1.25rem;
      transition: background-color 0.2s ease-in-out;
      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
  `,
};

function RoomCard({ room }: IRoomCard) {
  const { room_name, room_id, status } = room;
  const [me] = useMe();
  const history = useHistory();
  const { participants } = useGetRoomParticipants({ room_id });
  const { mutate: mutateDeleteRoom } = useDeleteRoom();

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

  const isHost =
    participants.some((participant) => participant.user_id === me?.user_id) &&
    participants.find((participant) => participant.user_id).role ===
      ParticipantType.HOST;

  const menus = React.useMemo(
    () => [
      {
        name: isHost ? "Delete" : "Leave",
        action: (e) => {
          e.stopPropagation();
          mutateDeleteRoom({ room_id, user_id: me.user_id });
        },
      },
    ],
    [isHost],
  );

  const getRandomColor = React.useMemo(() => {
    const color = ["#C6D57E", "#D57E7E", "#A2CDCD", "#FFE1AF"];

    return color[Math.floor(Math.random() * color.length)];
  }, []);

  return (
    <div
      onClick={() =>
        status === RoomStatus.ACCEPTED && history.push(`/room/${room_id}`)
      }
      className={cx(styled.card, { disabled: status !== RoomStatus.ACCEPTED })}
      title={status === RoomStatus.PENDING ? status : ""}
    >
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="menu" onClick={(e) => e.stopPropagation()}>
            <img src={KebabMenuSVG} className="icon" alt="icon" />
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" sideOffset={10}>
          <ul className={styled.menuDropdown}>
            {menus.map(({ name, action }, i) => (
              <li key={i} className="menu" onClick={action}>
                {name}
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Root>

      <div style={{ backgroundColor: getRandomColor }} className="initial">
        <span>{getInitialRoomName()}</span>
      </div>
      <div className="name">
        <span>{room_name}</span>
      </div>
    </div>
  );
}

export default RoomCard;
