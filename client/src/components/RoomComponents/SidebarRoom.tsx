import React, { useEffect, useState } from "react";
import { css, cx } from "@emotion/css";
import {
  useHistory,
  useLocation,
  useRouteMatch,
  useParams,
} from "react-router";
import { useGetUsersInWaitingRoom } from "../api-hooks";
import { menus } from "./constants";

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
  const { room_id } = useParams<{ room_id }>();
  const { url } = useRouteMatch();
  const [isNewNotification, setIsNewNotification] = useState<{
    "waiting-room"?: boolean;
    participants?: boolean;
  }>({
    "waiting-room": false,
  });
  const { usersInWaitingRoom } = useGetUsersInWaitingRoom(room_id);

  useEffect(() => {
    setIsNewNotification({
      ...isNewNotification,
      "waiting-room": usersInWaitingRoom.length > 0,
    });
  }, [usersInWaitingRoom]);

  return (
    <div className={styled.sidebar}>
      <button
        className="btn btn-outline-danger btn-block back"
        onClick={() => history.push("/")}
      >
        Back
      </button>
      <div className="menu-wrapper">
        {menus.map(({ label, name }, i) => (
          <div
            key={i}
            className={cx("menu", {
              active: name === activeMenu,
              notification: isNewNotification[name],
            })}
            onClick={() => history.push(name ? `${url}/${name}` : `${url}`)}
          >
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SidebarRoom;
