import { css, cx } from "@emotion/css";
import { format } from "date-fns";
import React, { useRef, useState } from "react";
import { useMeasure } from "../../../hooks";
import { useGetRoomMeetings } from "../../api-hooks";
import { Close } from "../../Shapes";
import { groupMeetingByDate } from "./helper";
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

function Home() {
  const rootRef = useRef<any>(null);
  const bounds = useMeasure(rootRef);

  const [openModal, setOpenModal] = useState(false);

  const { roomMeetings } = useGetRoomMeetings({ enabled: true });

  const groupedRoomMeetings = React.useMemo(
    () => groupMeetingByDate(roomMeetings),
    [roomMeetings],
  );

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
                    <MeetingCard key={meeting.meeting_id} {...meeting} />
                  ))}
                </ul>
              </React.Fragment>
            );
          })}
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
