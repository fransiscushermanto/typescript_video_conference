import Peer from "peerjs";
import React, { useEffect, useRef, useState } from "react";
import { Info } from "../../Shapes";
import { css } from "@emotion/css";
import RoomInfo from "./MeetingRoomInfo";
import { detectOnBlur } from "../../helper";
import { useMeetingRoom } from "../../../hooks";
import MeetingParticipantVideo from "./MeetingParticipantVideo";
import MyVideo from "./MyVideo";

interface Props {}

const styled = {
  roomInfoIconWrapper: css`
    position: absolute;
    left: 1.25rem;
    top: 2%;
    width: fit-content;
    height: auto;
  `,
  roomInfoButton: css`
    background-color: transparent;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background ease 0.2s;
    padding: 0.5rem;
    border-radius: 0.5rem;
    &:hover {
      background-color: rgba(0, 0, 0, 0.6);
    }
  `,
  videoWrapper: css`
    width: 100%;
    height: auto;
    max-height: calc(100vh - 70px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    overflow-y: auto;
  `,
  roomInfoIcon: css`
    cursor: pointer;
    width: 1.25rem;
    height: 1.25rem;
  `,
};

const MeetingRoomMain: React.FC<Props> = () => {
  const [openRoomInfo, setOpenRoomInfo] = useState(false);
  const {
    participantsState: [participants],
  } = useMeetingRoom();
  const roomIconRef = useRef(null);

  useEffect(() => {
    detectOnBlur(roomIconRef, openRoomInfo, setOpenRoomInfo);
  }, [openRoomInfo]);

  return (
    <div className="main">
      <div ref={roomIconRef} className={styled.roomInfoIconWrapper}>
        <button
          className={styled.roomInfoButton}
          onClick={() => setOpenRoomInfo((prev) => !prev)}
        >
          <Info className={styled.roomInfoIcon} fill={"white"} />
        </button>
        {openRoomInfo && <RoomInfo onClick={() => setOpenRoomInfo(true)} />}
      </div>
      <div id="video-wrapper" className={styled.videoWrapper}>
        <MyVideo />
        {participants?.map((participant, i) => {
          return <MeetingParticipantVideo key={i} {...participant} />;
        })}
      </div>
    </div>
  );
};

export default MeetingRoomMain;
