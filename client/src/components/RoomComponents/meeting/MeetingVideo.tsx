import { css } from "@emotion/css";
import React from "react";

interface Props {
  children?: React.ReactNode;
}

const styled = {
  root: css`
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
  `,
};

function MeetingVideo({ children }, ref) {
  return (
    <div className={styled.root}>
      <video
        onContextMenu={(e) => e.preventDefault()}
        className="video"
        ref={ref}
      />
      {children}
    </div>
  );
}

export default React.forwardRef<any, Props>(MeetingVideo);
