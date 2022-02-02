import Peer from "peerjs";
import React, { useEffect, useRef, useState } from "react";
import VideoHandler from "../../Handlers/VideoHandler";
import { Info } from "../../Shapes";
import { css } from "@emotion/css";
import RoomInfo from "./MeetingRoomInfo";
import { detectOnBlur } from "../../helper";

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
  roomInfoIcon: css`
    cursor: pointer;
    width: 1.25rem;
    height: 1.25rem;
  `,
};

const MeetingRoomMain: React.FC<Props> = () => {
  const [openRoomInfo, setOpenRoomInfo] = useState(false);
  const videoWrapperRef = useRef(null);
  const roomIconRef = useRef(null);
  const addVideoToStream = (video: HTMLVideoElement, stream: MediaStream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    console.log(video);
    videoWrapperRef.current.append(video);
  };

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
      <div ref={videoWrapperRef} id="video-wrapper" className="video-wrapper">
        {/* <VideoHandler connectToNewUser={connectToNewUser} /> */}
      </div>
    </div>
  );
};

export default MeetingRoomMain;
