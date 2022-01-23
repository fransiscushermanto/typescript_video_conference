import { css, cx } from "@emotion/css";
import React, { useRef, useState } from "react";
import { useMeasure } from "../../../hooks";
import { useGetRoomMeetings } from "../../api-hooks";
import { Close } from "../../Shapes";
import MeetingCard from "./MeetingCard";
import NewMeetingForm from "./NewMeetingForm";

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

function Home() {
  const rootRef = useRef<any>(null);
  const bounds = useMeasure(rootRef);

  const [openModal, setOpenModal] = useState(false);

  const { roomMeetings } = useGetRoomMeetings({ enabled: true });

  function handleOpenModal() {
    setOpenModal(true);
  }

  function handleCloseModal() {
    setOpenModal(false);
  }

  return (
    <div ref={rootRef} className={styled.root}>
      <header>
        <button
          className="btn btn-primary new-meeting"
          onClick={handleOpenModal}
        >
          New Meeting
        </button>
      </header>
      <div
        className={cx("meeting-list", styled.meetingListWrapper(bounds.height))}
      >
        <ul>
          {roomMeetings &&
            Object.entries(roomMeetings).map(([meeting_id, value]) => (
              <MeetingCard
                key={meeting_id}
                meeting_id={meeting_id}
                meeting_name={value.meeting_name}
              />
            ))}
        </ul>
      </div>

      {openModal && (
        <div className="create-meeting-modal modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <div className="title">New Meeting</div>
              <div className="close" onClick={handleCloseModal}>
                <Close />
              </div>
            </div>
            <div className="modal-body">
              <NewMeetingForm handleCloseModal={handleCloseModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
