import { css, cx } from "@emotion/css";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { useMeasure, useSocket } from "../../../hooks";
import {
  useGetRoomMeetings,
  useGetRoomParticipantFaces,
} from "../../api-hooks";
import { Close } from "../../Shapes";
import { groupMeetingByDate } from "./helper";
import MeetingCard from "./MeetingCard";
import NewMeetingForm from "./NewMeetingForm";
import useRoomSocket from "./../../../hooks/use-room-socket";
import RegisterFaceModal from "./RegisterFaceModal";
import { queryClient } from "../../..";
import { MAX_FACES } from "../constants";

const styled = {
  root: css`
    height: 100%;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    header {
      margin-bottom: 1rem;

      height: 70px;
      display: flex;
      flex-direction: row;
      align-items: center;

      background-color: transparent;

      .new-meeting {
        margin-left: auto;
      }
    }

    .meeting-list {
      height: 100%;
      overflow-y: auto;
      width: 100%;
      .date-group {
        display: flex;
        align-items: center;
        margin-bottom: 0.625rem;
        .text {
          white-space: nowrap;
          margin: 0 1.25rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .line {
          width: 100%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
      .date-group-meetings {
        margin-bottom: 0.625rem;
      }
    }
    .create-meeting-modal {
      .modal-content {
        min-height: 300px;
        width: 500px;
      }
    }
  `,
  meetingListWrapper: (maxHeight: number) => css`
    max-height: ${`${maxHeight - 70}px` || "100%"};
  `,
};

const INITIAL_MODAL = {
  "new-meeting": false,
  "register-face": false,
};

function Home() {
  const roomSocket = useRoomSocket();
  const socket = useSocket();
  const rootRef = useRef<any>(null);
  const bounds = useMeasure(rootRef);

  const [meetingsActiveParticipant, setMeetingActiveParticipant] = useState({});
  const [openModal, setOpenModal] = useState(INITIAL_MODAL);

  const { roomMeetings } = useGetRoomMeetings({ enabled: true });
  const { data: participantFaces, isFetching: isParticipantFaceLoading } =
    useGetRoomParticipantFaces({
      enabled: true,
    });

  const groupedRoomMeetings = React.useMemo(
    () => groupMeetingByDate(roomMeetings),
    [roomMeetings],
  );

  function handleOpenModal(modalKey: "new-meeting" | "register-face") {
    setOpenModal((prev) => ({ ...prev, [modalKey]: true }));
  }

  function handleCloseModal(modalKey?: "new-meeting" | "register-face") {
    if (!modalKey) setOpenModal(INITIAL_MODAL);

    setOpenModal((prev) => ({ ...prev, [modalKey]: false }));
  }

  useEffect(() => {
    roomSocket?.emit("GET_MEETING_ACTIVE_PARTICIPANTS");
  }, [roomSocket]);

  useEffect(() => {
    if (participantFaces?.length !== MAX_FACES && !isParticipantFaceLoading)
      handleOpenModal("register-face");
  }, [isParticipantFaceLoading, participantFaces]);

  useEffect(() => {
    socket.on("MEETING_ACTIVE_PARTICIPANTS", ({ participants }) => {
      setMeetingActiveParticipant(participants);
    });

    socket.on(
      "UPDATE_MEETING_ACTIVE_PARTICIPANTS",
      ({ meeting_id, total_in_meeting_participants }) => {
        setMeetingActiveParticipant({
          ...meetingsActiveParticipant,
          [meeting_id]: total_in_meeting_participants,
        });
      },
    );

    return () => {
      queryClient.resetQueries("room-participant-face");
      handleCloseModal();
    };
  }, []);

  return (
    <div ref={rootRef} className={styled.root}>
      <header>
        <button
          className="btn btn-primary new-meeting"
          onClick={() => handleOpenModal("new-meeting")}
        >
          New Meeting
        </button>
      </header>
      <div
        className={cx("meeting-list", styled.meetingListWrapper(bounds.height))}
      >
        {groupedRoomMeetings &&
          groupedRoomMeetings.map(({ date, meetings }) => {
            return (
              <React.Fragment key={date}>
                <div className="date-group">
                  <span className="line"></span>
                  <span className="text">
                    {format(new Date(date), "eeee, dd MMM yyyy")}
                  </span>
                  <span className="line"></span>
                </div>
                <ul className="date-group-meetings">
                  {meetings.map((meeting) => (
                    <MeetingCard
                      active_participants={
                        meetingsActiveParticipant[meeting.meeting_id]
                      }
                      key={meeting.meeting_id}
                      {...meeting}
                    />
                  ))}
                </ul>
              </React.Fragment>
            );
          })}
      </div>

      {openModal["register-face"] && (
        <RegisterFaceModal onClose={() => handleCloseModal("register-face")} />
      )}

      {openModal["new-meeting"] && (
        <div className="create-meeting-modal modal backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <div className="title">New Meeting</div>
              <div
                className="close"
                onClick={() => handleCloseModal("new-meeting")}
              >
                <Close />
              </div>
            </div>
            <div className="modal-body">
              <NewMeetingForm
                handleCloseModal={() => handleCloseModal("new-meeting")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
