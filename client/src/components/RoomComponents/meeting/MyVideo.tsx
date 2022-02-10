import React, { useEffect } from "react";
import { useMeetingRoom } from "../../../hooks";
import MeetingVideo from "./MeetingVideo";

interface Props {}

const MyVideo: React.FC<Props> = () => {
  const {
    roomState: [room],
    localVideoRef,
  } = useMeetingRoom();
  const permission = room?.room_permission;

  useEffect(() => {
    if (!permission?.camera) {
      if (localVideoRef.current.srcObject) {
        (function stopVideo() {
          const video_stream = localVideoRef.current.srcObject as MediaStream;
          const tracks: MediaStreamTrack[] = video_stream.getTracks();
          tracks.forEach((track) => {
            track.stop();
          });

          localVideoRef.current.srcObject = null;
        })();
      }
    }
  }, [permission]);

  return <MeetingVideo ref={localVideoRef} />;
};

export default MyVideo;
