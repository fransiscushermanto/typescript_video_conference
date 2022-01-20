import { css } from "@emotion/css";
import React, { useState } from "react";
import { useGetRoomMeetings } from "../../api-hooks";
import { Close } from "../../Shapes";
import NewMeetingForm from "./NewMeetingForm";

const styled = {
  root: css`
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

    .create-meeting-modal {
      .modal-content {
        min-height: 300px;
        width: 500px;
      }
    }
  `,
};

function Home() {
  const [openModal, setOpenModal] = useState(false);

  const { roomMeetings } = useGetRoomMeetings({ enabled: true });

  function handleOpenModal() {
    setOpenModal(true);
  }

  function handleCloseModal() {
    setOpenModal(false);
  }

  return (
    <div className={styled.root}>
      <header>
        <button
          className="btn btn-primary new-meeting"
          onClick={handleOpenModal}
        >
          New Meeting
        </button>
      </header>
      <div className="meeting-list">
        <ul>
          {roomMeetings &&
            Object.entries(roomMeetings).map(([key, value]) => (
              <li>
                <div>id: {key}</div>
                <div>name: {value?.meeting_name}</div>
              </li>
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
