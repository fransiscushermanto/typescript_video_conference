import { css, cx } from "@emotion/css";
import React, { useMemo, useState } from "react";
import { useHistory } from "react-router";
import { ParticipantType, RoomStatus } from "../../api-hooks/type";
import KebabMenuSVG from "../../../assets/kebab-menu.svg";
import * as Popover from "@radix-ui/react-popover";
import { useDeleteRoom } from "./../../api-hooks/mutation";
import useMe from "./../../../hooks/use-me";
import { useSocket } from "../../../hooks";
import { getInitialFromString, hashCode, intToRGB } from "../../helper";
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
  const socket = useSocket();
  const { room_name, room_id, status } = room;
  const [me] = useMe();
  const history = useHistory();
  const { participants } = useGetRoomParticipants({ enabled: true, room_id });
  const myRole = useMemo(
    () =>
      participants?.find((participant) => participant.user_id === me.user_id)
        ?.role,
    [me.user_id, participants],
  );

  const { mutate: mutateDeleteRoom } = useDeleteRoom();

  const isHost = myRole === ParticipantType.HOST;
  const initials = React.useMemo(() => getInitialFromString(room_name), []);
  const [isOpen, setIsOpen] = useState(false);
  const menus = React.useMemo(
    () => [
      {
        name: isHost ? "Delete" : "Leave",
        action: (e) => {
          e.stopPropagation();
          setIsOpen(false);
          socket.emit("LEAVE_ROOM", { room_id, me });
          mutateDeleteRoom({ room_id, user_id: me.user_id });
        },
      },
    ],
    [isHost],
  );

  function onCardClick() {
    if (status === RoomStatus.ACCEPTED) {
      history.push(`/room/${room_id}`);
    }
  }

  return (
    <div
      onClick={onCardClick}
      className={cx(styled.card, { disabled: status !== RoomStatus.ACCEPTED })}
      title={status === RoomStatus.PENDING ? status : ""}
    >
      <Popover.Root open={isOpen}>
        <Popover.Trigger asChild>
          <button
            className="menu"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
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

      <div
        style={{
          backgroundColor: intToRGB(hashCode(room_id)),
        }}
        className="initial"
      >
        <span>{initials}</span>
      </div>
      <div className="name">
        <span>{room_name}</span>
      </div>
    </div>
  );
}

export default RoomCard;
