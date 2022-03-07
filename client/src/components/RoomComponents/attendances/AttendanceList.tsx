import { css, cx } from "@emotion/css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  IconButton,
} from "@material-ui/core";
import {
  ExpandMore as ExpandMoreIcon,
  ArrowForwardIos as ArrowBackIcon,
} from "@material-ui/icons";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import { queryClient } from "../../..";
import {
  useGetMeetingAttendanceReport,
  useGetMeetingRoomInfo,
  useGetParticipantsMeetingAttendance,
} from "../../api-hooks";
import { MeetingAttendanceStatus } from "./types";
import ExcelIcon from "../../../assets/excel.svg";
import { useMeasure } from "../../../hooks";
import saveAs from "file-saver";
import { stringToArrayBuffer } from "../../helper";

const styled = {
  root: css`
    height: 100%;
    header {
      margin-bottom: 1rem;
      display: flex;
      flex-wrap: nowrap;
      h1 {
        margin-bottom: 0;
      }
      .back-btn {
        margin-right: 1rem;
        transform: rotate(180deg);
      }
      .live-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;

        margin-left: auto;
      }
    }

    .t-row {
      display: grid;
      grid-template-columns: 3fr minmax(365px, 1fr);

      &.t-header {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 1rem;
        .t-col {
          padding: 1rem 0;
          padding-left: 1.25rem;
          &:nth-child(odd):not(:last-child) {
            border-right: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
      }
      &.t-body {
        &:not(:last-child) {
          margin-bottom: 1rem;
        }
        > .t-col {
          grid-column: 1/3;
          .MuiAccordionSummary-root,
          .MuiAccordionDetails-root {
            padding: 0;
          }

          .MuiIconButton-edgeEnd {
            margin-right: unset;
          }
          .attendance {
            min-height: 0;
            .MuiAccordionSummary-content {
              margin: 0;
            }
          }
          .attendance-detail {
            padding: 1rem 1.25rem;
            display: flex;
            flex-direction: column;
            .preview-image {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
      &.attendance-content {
        width: 100%;
        display: flex;
        .participant-name {
          padding-left: 1.25rem;
          flex: 1;
        }
        .checked-in-time {
          padding-left: 1.25rem;

          flex: 1;
          width: 100%;
        }
      }
      &.empty-container {
        display: flex;
        justify-content: center;
      }
    }

    .loading-wrapper {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .export-btn {
      z-index: 10;
      position: absolute;
      right: 1%;
      bottom: 5%;
    }
  `,
  checkInWidth: (parentWidth: number) => css`
    max-width: calc(${parentWidth}px - 48px);
  `,
};

const attendanceStatusLabel = {
  [MeetingAttendanceStatus.FINISH]: "Finish",
  [MeetingAttendanceStatus.ONGOING]: "Ongoing",
  [MeetingAttendanceStatus.INCOMING]: "Incoming",
};

function AttendanceList() {
  const { url } = useRouteMatch();
  const history = useHistory();
  const { room_id, meeting_id } = useParams<{ room_id; meeting_id }>();
  const { data: meetingInfo, isFetching: isFetchingMeetingRoomInfo } =
    useGetMeetingRoomInfo({ room_id, meeting_id }, { enabled: true });
  const {
    data: participantsAttendance,
    isFetching: isFetchingParticipantsAttendance,
  } = useGetParticipantsMeetingAttendance({
    enabled: true,
  });

  const colCheckInRef = useRef<any>();

  const isLoading =
    isFetchingMeetingRoomInfo && isFetchingParticipantsAttendance;

  const bound = useMeasure(colCheckInRef.current ? colCheckInRef : {});

  const { refetch: getAttendanceReport } = useGetMeetingAttendanceReport({
    onSuccess: (res) => {
      console.log(res);
      const blob = new Blob([res.data], {
        type: "xlsx",
      });
      const fileName = `${meetingInfo.meeting_name} - Attendance.xlsx`;
      saveAs(blob, fileName);
    },
  });
  const [attendanceStatus, setAttendanceStatus] =
    useState<MeetingAttendanceStatus>();

  function goBack() {
    const splitUrl = url.split(`/${meeting_id}`)[0];
    history.push(splitUrl);
  }

  useEffect(() => {
    return () => {
      queryClient.resetQueries("meeting-room-info");
      queryClient.resetQueries(`participants-meeting-attendance/${meeting_id}`);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (!isFetchingMeetingRoomInfo && meetingInfo) {
      const incoming = new Date() < new Date(meetingInfo.attendance_start_at);
      const ongoing = new Date() < new Date(meetingInfo.attendance_finish_at);
      const finish = new Date() >= new Date(meetingInfo.attendance_finish_at);
      if (finish) {
        setAttendanceStatus(MeetingAttendanceStatus.FINISH);
      } else if (incoming) {
        setAttendanceStatus(MeetingAttendanceStatus.INCOMING);
      } else if (ongoing) {
        setAttendanceStatus(MeetingAttendanceStatus.ONGOING);
      }

      interval = setInterval(() => {
        const incoming = new Date() < new Date(meetingInfo.attendance_start_at);
        const ongoing = new Date() < new Date(meetingInfo.attendance_finish_at);
        const finish = new Date() >= new Date(meetingInfo.attendance_finish_at);

        if (finish) {
          setAttendanceStatus(MeetingAttendanceStatus.FINISH);
        } else if (incoming) {
          setAttendanceStatus(MeetingAttendanceStatus.INCOMING);
        } else if (ongoing) {
          setAttendanceStatus(MeetingAttendanceStatus.ONGOING);
        }

        clearInterval(interval);
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [isFetchingMeetingRoomInfo, meetingInfo]);

  return (
    <div className={styled.root}>
      {attendanceStatus === MeetingAttendanceStatus.FINISH &&
        participantsAttendance?.length > 0 && (
          <div className="export-btn">
            <IconButton
              style={{ color: "white" }}
              title="Export attendance to Excel"
              aria-label="export"
              onClick={() => getAttendanceReport()}
            >
              <img src={ExcelIcon} width={48} height={48} alt="" />
            </IconButton>
          </div>
        )}
      {isLoading ? (
        <div className="loading-wrapper">
          <CircularProgress />
        </div>
      ) : (
        <>
          <header>
            <IconButton onClick={goBack} aria-label="back" className="back-btn">
              <ArrowBackIcon style={{ color: "white" }} />
            </IconButton>
            <h1>{meetingInfo?.meeting_name}</h1>
            {attendanceStatus && (
              <h1 className="live-wrapper">
                {attendanceStatusLabel[attendanceStatus]}
              </h1>
            )}
          </header>
          <div className="t-header t-row">
            <div className="t-col">Username</div>
            <div ref={colCheckInRef} className="t-col">
              Check-in Time
            </div>
          </div>
          {participantsAttendance?.length < 1 && (
            <div className="t-body t-row empty-container">
              <div className="t-col">No Records</div>
            </div>
          )}
          {participantsAttendance?.map((participantAttendance, i) => (
            <div key={i} className="t-body t-row">
              <Accordion className="t-col">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className="attendance"
                >
                  <div className="t-row attendance-content">
                    <div className="participant-name">
                      <span>{participantAttendance.user_info.displayName}</span>{" "}
                      <span>({participantAttendance.user_info.email})</span>
                    </div>
                    <div
                      className={cx(
                        "checked-in-time",
                        styled.checkInWidth(bound.right),
                      )}
                    >
                      <span>
                        {format(
                          new Date(participantAttendance.checked_in_at),
                          "dd-MM-yyyy HH:ss",
                        )}
                      </span>
                    </div>
                  </div>
                </AccordionSummary>
                <AccordionDetails className="attendance-detail">
                  <h5>Preview Image</h5>
                  <img
                    className="preview-image"
                    src={participantAttendance.preview_image}
                    alt=""
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default AttendanceList;
