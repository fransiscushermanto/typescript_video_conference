import { css } from "@emotion/css";
import React from "react";
import Webcam from "react-webcam";
import { useMeetingRoom } from "../../../hooks";

interface Props {}

const MyVideo: React.FC<Props> = () => {
  const { localVideoRef } = useMeetingRoom();

  return (
    <div
      className={css`
        position: relative;
        width: 100%;
        height: 100%;
        max-height: 300px;
        max-width: 400px;

        display: flex;
        align-items: center;
        justify-content: center;

        margin: 0.15rem;
        video {
          width: 100%;
          height: 300px;
          max-height: 300px;
        }
      `}
    >
      <Webcam
        onContextMenu={(e) => e.preventDefault()}
        ref={(e) => {
          if (localVideoRef) {
            localVideoRef.current = e?.video;
          }
        }}
        className="video"
      />
    </div>
  );
};

export default MyVideo;
