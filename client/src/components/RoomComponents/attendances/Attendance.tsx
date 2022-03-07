import { css } from "@emotion/css";
import { CircularProgress } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomMeetingModel } from "../../api-hooks/type";
import { useGetRoomMeetings } from "./../../api-hooks/query";
import AttendanceList from "./AttendanceList";
import AttendanceMeetingCard from "./AttendanceMeetingCard";
import { groupMeetingByAttendanceStatus } from "./helper";
import { MeetingAttendanceStatus } from "./types";

const styled = {
  root: css`
    position: relative;
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
    .attendance-status {
      margin-bottom: 0.625rem;
      font-weight: bold;
    }

    .loading-wrapper {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
};

function Attendance() {
  const { roomMeetings, isFetching: isLoadingRoomMeetings } =
    useGetRoomMeetings({ enabled: true });

  const { meeting_id } = useParams<{ meeting_id }>();
  const [isMeetingStatusChange, setIsMeetingStatusChange] =
    useState<boolean>(false);

  const [
    groupedMeetingsByAttendanceStatus,
    setGroupedMeetingsByAttendanceStatus,
  ] = useState<
    {
      attendance_status: string;
      meetings: RoomMeetingModel[];
    }[]
  >(groupMeetingByAttendanceStatus(roomMeetings));

  useEffect(() => {
    if (roomMeetings) {
      setGroupedMeetingsByAttendanceStatus(
        groupMeetingByAttendanceStatus(roomMeetings),
      );
    }
  }, [roomMeetings]);

  useEffect(() => {
    if (isMeetingStatusChange) {
      setGroupedMeetingsByAttendanceStatus(
        groupMeetingByAttendanceStatus(roomMeetings),
      );
      setIsMeetingStatusChange(false);
    }
  }, [isMeetingStatusChange, roomMeetings]);

  return (
    <div className={styled.root}>
      {isLoadingRoomMeetings && !meeting_id && (
        <div className="loading-wrapper">
          <CircularProgress />
        </div>
      )}
      {meeting_id ? (
        <AttendanceList />
      ) : (
        !isLoadingRoomMeetings &&
        groupedMeetingsByAttendanceStatus.map(
          ({ attendance_status, meetings }) => (
            <React.Fragment key={attendance_status}>
              <div className="attendance-status">
                <span>
                  {attendance_status.substring(0, 1).toUpperCase()}
                  {attendance_status.substring(1, attendance_status.length)}
                </span>
              </div>
              {meetings.map((meeting) => (
                <AttendanceMeetingCard
                  attendanceStatus={
                    attendance_status as MeetingAttendanceStatus
                  }
                  onStatusChange={() => {
                    setIsMeetingStatusChange(true);
                  }}
                  key={meeting.meeting_id}
                  {...meeting}
                />
              ))}
            </React.Fragment>
          ),
        )
      )}
    </div>
  );
}

export default Attendance;
