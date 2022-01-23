import React, { useEffect } from "react";
import { css, cx } from "@emotion/css";
import { useHistory, useRouteMatch, useParams } from "react-router";
import {
  useGetRoomNotification,
  useGetRoomParticipants,
  useGetUsersInWaitingRoom,
} from "../api-hooks";
import { menus } from "./constants";
import { useGetRole, useMe, useSocket } from "../../hooks";
import { pushNotification } from "../helper";

const styled = {
  sidebar: css`
    width: 100%;
    min-width: 12.5rem;
    max-width: 12.5rem;
    height: 100%;
    background-color: white;
    padding: 2.5rem 0.625rem 4rem;
    .back {
      margin-bottom: 2.5rem;
    }
    .menu {
      position: relative;
      cursor: pointer;
      height: 2.5rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      transition: background-color ease 0.2s, color ease 0.2s;
      border-radius: 0.25rem;
      &:hover,
      &.active {
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
      }
      &.notification::after {
        content: "";
        top: -10%;
        right: -2%;
        position: absolute;
        background-color: red;
        width: 10px;
        height: 10px;
        clip-path: circle();
      }
      > span {
        user-select: none;
        pointer-events: none;
      }
      &:not(:last-child) {
        margin-bottom: 0.625rem;
      }
    }
  `,
};

function SidebarRoom({ activeMenu }: { activeMenu: string }) {
  const history = useHistory();
  const socket = useSocket();
  const [me] = useMe();
  const { room_id } = useParams<{ room_id }>();
  const { url } = useRouteMatch();
  const myRole = useGetRole();

  const { roomNotifications } = useGetRoomNotification({
    enabled: !!me?.user_id,
    refetchOnWindowFocus: false,
  });

  const { usersInWaitingRoom } = useGetUsersInWaitingRoom(room_id, {
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const notifOnDelete = React.useMemo(
    () => usersInWaitingRoom.length === 0 && { "waiting-room": false },
    [usersInWaitingRoom],
  );

  const currentMenuNotif = roomNotifications[activeMenu];
  const isRoleAllowedToReceiveNotification = React.useCallback(
    (currentMenu) =>
      menus.find((menu) => menu.name === currentMenu)?.role?.includes(myRole),
    [myRole],
  );

  useEffect(() => {
    if (currentMenuNotif && isRoleAllowedToReceiveNotification(activeMenu)) {
      socket?.emit("UPDATE_ROOM_NOTIFICATION", {
        user_id: me?.user_id,
        room_id,
        notif: {
          [activeMenu]: false,
        },
      });
    }
  }, [activeMenu, socket, currentMenuNotif, room_id, activeMenu]);

  useEffect(() => {
    socket?.on("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", ({ type }) => {
      if (isRoleAllowedToReceiveNotification("waiting-room")) {
        if (type === "add") {
          pushNotification({ body: "New user is requesting to join room" });
          socket?.emit("UPDATE_ROOM_NOTIFICATION", {
            user_id: me?.user_id,
            room_id,
            notif: { "waiting-room": true },
          });
        } else if (type === "delete") {
          socket?.emit("UPDATE_ROOM_NOTIFICATION", {
            user_id: me?.user_id,
            room_id,
            notif: {
              ...notifOnDelete,
            },
          });
        }
      }
    });
    return () => {
      socket?.off("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", () => {});
    };
  }, [myRole]);

  return (
    <div className={styled.sidebar}>
      <button
        className="btn btn-outline-danger btn-block back"
        onClick={() => history.push("/")}
      >
        Back
      </button>
      <div className="menu-wrapper">
        {menus.map(({ label, name, role }, i) => {
          if (role && !role?.includes(myRole)) return null;
          return (
            <div
              key={i}
              className={cx("menu", {
                active: name === activeMenu,
                notification: roomNotifications[name],
              })}
              onClick={() => history.push(name ? `${url}/${name}` : `${url}`)}
            >
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SidebarRoom;
