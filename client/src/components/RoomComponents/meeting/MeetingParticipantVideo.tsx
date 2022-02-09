import React from "react";
import { WebRTCUser } from "../../Providers/MeetingRoomProvider";

interface Props extends WebRTCUser {
  muted?: boolean;
}

function MeetingParticipantVideo({ stream, muted, user_id }: Props) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
    if (muted) setIsMuted(muted);
  }, [stream, muted]);

  return (
    <div style={{ position: "relative" }}>
      <video className="video" ref={ref} muted={isMuted} autoPlay />
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
    </div>
  );
}

export default MeetingParticipantVideo;
