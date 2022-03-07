import { css, keyframes } from "@emotion/css";
import { format } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useGetParticipantsMeetingAttendance } from "../../api-hooks";
import { RoomMeetingModel } from "../../api-hooks/type";
import { formatTimeDurationToReadableFormat } from "../../helper";
import { MeetingAttendanceStatus } from "./types";

interface AttendanceMeetingCardProps extends RoomMeetingModel {
  attendanceStatus?: MeetingAttendanceStatus;
  onStatusChange?: () => void;
}

const pulseFade = keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const styled = {
  root: css`
    &:not(:last-child) {
      margin-bottom: 0.625rem;
    }

    cursor: pointer;

    width: 100%;
    background-color: white;
    padding: 0.625rem;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;

    border-radius: 0.625rem;

    color: black;
    .info-text {
      font-size: 0.75rem;
    }

    .left {
      flex: 1;
      .meeting-name {
        font-weight: bold;
        display: flex;
        flex-direction: row;
        align-items: center;
        .divider {
          margin: 0 0.5rem;
        }
        .live-wrapper {
          position: relative;

          display: flex;
          flex-direction: row;
          .bullet {
            top: 10%;
            right: -25%;
            position: absolute;

            width: 6px;
            height: 6px;
            background-color: red;
            animation: ${pulseFade} 2s 2s linear infinite;
            display: block;

            clip-path: circle();
          }
        }
      }
    }
    .right {
    }
  `,
};

function AttendanceMeetingCard({
  meeting_id,
  meeting_name,
  created_at,
  attendance_finish_at,
  attendance_start_at,
  attendanceStatus,
  onStatusChange,
}: AttendanceMeetingCardProps) {
  const {
    data: participantsAttendance,
    isLoading: isLoadingParticipantsAttendance,
  } = useGetParticipantsMeetingAttendance({
    meeting_id,
    enabled: true,
  });

  const { url } = useRouteMatch();
  const history = useHistory();
  const [strIncomingTime, setStrIncomingTime] = useState<string>(
    formatTimeDurationToReadableFormat({
      start: new Date(),
      end: new Date(attendance_start_at),
      format: ["days", "hours", "minutes", "seconds"],
    }),
  );
  const [strTimeLeft, setStrTimeLeft] = useState<string>(
    formatTimeDurationToReadableFormat({
      start: new Date(),
      end: new Date(attendance_finish_at),
      format: ["days", "hours", "minutes", "seconds"],
    }),
  );

  const onClick = useCallback(
    (meeting_id: string) => {
      history.push(`${url}/${meeting_id}`);
    },
    [url, history],
  );

  useEffect(() => {
    let interval;
    switch (attendanceStatus) {
      case MeetingAttendanceStatus.ONGOING:
        interval = setInterval(() => {
          const now = new Date();
          if (now >= new Date(attendance_finish_at)) {
            onStatusChange?.();
            clearInterval(interval);
          } else {
            setStrTimeLeft(
              formatTimeDurationToReadableFormat({
                start: new Date(),
                end: new Date(attendance_finish_at),
                format: ["days", "hours", "minutes", "seconds"],
              }),
            );
          }
        }, 1e3);
        break;
      case MeetingAttendanceStatus.INCOMING:
        interval = setInterval(() => {
          const now = new Date();
          if (now >= new Date(attendance_start_at)) {
            onStatusChange?.();
            clearInterval(interval);
          } else {
            setStrIncomingTime(
              formatTimeDurationToReadableFormat({
                start: new Date(),
                end: new Date(attendance_start_at),
                format: ["days", "hours", "minutes", "seconds"],
              }),
            );
          }
        }, 1e3);
        break;
      default:
        clearInterval(interval);
        break;
    }
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styled.root} onClick={() => onClick(meeting_id)}>
      <div className="left">
        <div className="meeting-name">
          <span>{meeting_name}</span>
          {attendanceStatus === MeetingAttendanceStatus.ONGOING && (
            <>
              <span className="divider">-</span>
              <div className="live-wrapper">
                <span>Live</span>
                <span className="bullet" />
              </div>
            </>
          )}
        </div>
        {attendanceStatus === MeetingAttendanceStatus.FINISH && (
          <div className="created-at info-text">
            <span>Created at: </span>
            <span>{format(new Date(created_at), "dd-MM-yyyy HH:mm")}</span>
          </div>
        )}

        {attendanceStatus === MeetingAttendanceStatus.INCOMING && (
          <div className="incoming-info  info-text">
            <span>
              Meeting Attendance will start in <b>{strIncomingTime}</b>
            </span>
          </div>
        )}

        {attendanceStatus === MeetingAttendanceStatus.ONGOING && (
          <div className="ongoing-info info-text">
            <span>
              Meeting Attendance will over in <b>{strTimeLeft}</b>
            </span>
          </div>
        )}
      </div>
      <div className="right">
        {!isLoadingParticipantsAttendance &&
          attendanceStatus !== MeetingAttendanceStatus.INCOMING && (
            <div className="total-attendance info-text">
              <span>
                Total: <b>{participantsAttendance?.length}</b> participant(s)
              </span>
            </div>
          )}
      </div>
    </div>
  );
}

export default AttendanceMeetingCard;
