import { css } from "@emotion/css";
import * as Popover from "@radix-ui/react-popover";
import KebabMenuSVG from "../../../assets/kebab-menu.svg";
import UsersSVG from "../../../assets/users.svg";
import React, { useEffect, useState } from "react";
import { useGetRole, useInterval, useRoomSocket } from "../../../hooks";
import { ParticipantType, RoomMeetingModel } from "../../api-hooks/type";
import { User } from "firebase/auth";
import { format } from "date-fns";
import { useDeleteRoomMeeting } from "../../api-hooks";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import {
  intToRGB,
  hashCode,
  getInitialFromString,
  formatTimeDurationToReadableFormat,
} from "../../helper";

interface IProps extends RoomMeetingModel {
  active_participants?: number;
}

const styled = {
  root: css`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;

    color: black;

    &:not(:last-child) {
      margin-bottom: 1.25rem;
    }

    .inner-card {
      width: 100%;
      background-color: white;
      padding: 0.625rem;

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;

      border-radius: 0.625rem;

      .meeting-info {
        display: flex;
        flex-direction: column;
        margin-right: 0.625rem;
        .other {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: flex-start;

          line-height: 21px;

          > div:not(:last-child) {
            margin-right: 0.625rem;
          }
          .created_at {
            font-size: 0.75rem;
            color: rgba(0, 0, 0, 0.5);

            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .created_by {
            font-size: 0.875rem;
            font-weight: 600;

            text-overflow: ellipsis;
            max-width: 100%;
          }
        }

        .meeting_name {
          font-weight: bold;
        }
      }

      .right-item {
        display: flex;
        align-items: center;
        margin-left: auto;
      }

      .active-participants {
        height: 100%;
        display: flex;
        align-items: center;
        margin-right: 0.625rem;

        .label {
          font-size: 0.875rem;
        }

        .icon {
          margin-left: 0.25rem;

          width: 20px;
          height: 20px;
          display: flex;
          img {
            width: 100%;
            height: 100%;
          }
        }
      }

      .menu-trigger {
        background-color: transparent;
        border: none;
        .icon {
          transform: rotate(90deg);
        }
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

  profile: (bg: string) => css`
    margin-right: 0.625rem;

    height: 2.75rem;
    width: 2.75rem;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: ${bg};

    clip-path: circle();
  `,
};

function MeetingCard({
  meeting_id,
  created_by,
  meeting_name,
  created_at,
  active_participants,
  attendance_start_at,
}: IProps) {
  const { role: myRole } = useGetRole();
  const { url } = useRouteMatch();
  const { room_id } = useParams<{ room_id }>();
  const { setInterval, clearInterval } = useInterval();
  const { mutate: mutateDeleteRoomMeeting } = useDeleteRoomMeeting();
  const [isJoinable, setIsJoinable] = useState(
    new Date(attendance_start_at) <= new Date(),
  );
  const [durationText, setDurationText] = useState(
    formatTimeDurationToReadableFormat({
      start: new Date(),
      end: new Date(attendance_start_at),
      format: ["days", "hours", "minutes", "seconds"],
    }),
  );
  const roomSocket = useRoomSocket();

  const initials = React.useMemo(
    () => getInitialFromString(created_by.displayName),
    [],
  );
  const menus = React.useMemo(
    () => [
      {
        name: "Delete",
        action: (e) => {
          e.stopPropagation();
          if (active_participants && active_participants > 0) {
            alert(
              "Sorry, unable to delete meeting participants still in room.",
            );
          } else {
            mutateDeleteRoomMeeting({ room_id, meeting_id });
          }
        },
        role: [ParticipantType.HOST],
      },
    ],
    [active_participants],
  );

  function onJoin() {
    if (roomSocket.disconnected) {
      roomSocket.connect();
    }
    window.location.href = `${url}/meeting/${meeting_id}`;
  }

  useEffect(() => {
    if (!isJoinable) {
      setInterval(() => {
        const result = new Date(attendance_start_at) <= new Date();
        setDurationText(
          formatTimeDurationToReadableFormat({
            start: new Date(),
            end: new Date(attendance_start_at),
            format: ["days", "hours", "minutes", "seconds"],
          }),
        );
        setIsJoinable(result);
      }, 1e3);
    }
  }, []);

  useEffect(() => {
    if (isJoinable) {
      clearInterval();
    }
  }, [isJoinable]);

  return (
    <div className={styled.root}>
      <div className={styled.profile(intToRGB(hashCode(created_by.uid)))}>
        <span>{initials}</span>
      </div>
      <div className="inner-card">
        <div className="meeting-info">
          <div className="other">
            <div className="created_by">
              <span>{created_by.displayName}</span>
            </div>
            <div className="created_at">
              <span>{format(new Date(created_at), "dd/MM/yyyy HH.mm")}</span>
            </div>
          </div>
          <div className="meeting_name">
            <span>{meeting_name}</span>
          </div>
        </div>
        <div className="right-item">
          <div className="active-participants">
            <span className="label">{active_participants || 0}</span>
            <span className="icon">
              <img src={UsersSVG} alt="user" />
            </span>
          </div>
          <button
            disabled={!isJoinable}
            className="join-btn btn btn-success"
            onClick={onJoin}
            title={!isJoinable ? `Meeting is opened in ${durationText}` : ""}
          >
            Join
          </button>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                className="menu-trigger"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={KebabMenuSVG} className="icon" alt="icon" />
              </button>
            </Popover.Trigger>
            <Popover.Content align="start" sideOffset={10}>
              <ul className={styled.menuDropdown}>
                {menus
                  .filter(({ role }) => role && role.includes(myRole))
                  .map(({ name, action }, i) => (
                    <li key={i} className="menu" onClick={action}>
                      {name}
                    </li>
                  ))}
              </ul>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
    </div>
  );
}

export default MeetingCard;
