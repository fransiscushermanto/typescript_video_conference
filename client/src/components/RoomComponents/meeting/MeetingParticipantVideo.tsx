import React from "react";
import { WebRTCUser } from "../../Providers/MeetingRoomProvider";
import MeetingVideo from "./MeetingVideo";

interface Props extends WebRTCUser {
  muted?: boolean;
}

function MeetingParticipantVideo({ stream, muted, user_id }: Props) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    console.log(stream);
    if (ref.current) {
      ref.current.srcObject = stream;
      ref.current.autoplay = stream.active;
      ref.current.muted = muted;
    }
  }, [stream, muted]);

  return (
    <MeetingVideo ref={ref}>
      <div
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
      >
        {user_id}
      </div>
    </MeetingVideo>
  );
}

export default MeetingParticipantVideo;
