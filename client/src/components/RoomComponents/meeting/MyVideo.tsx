import React, { useEffect } from "react";
import { useMeetingRoom } from "../../../hooks";
import MeetingVideo from "./MeetingVideo";

interface Props {}

const MyVideo: React.FC<Props> = () => {
  const { localVideoRef } = useMeetingRoom();

  return <MeetingVideo ref={localVideoRef} />;
};

export default MyVideo;
