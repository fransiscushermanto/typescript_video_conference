import React from "react";
import { WebRTCUser } from "../../Providers/MeetingRoomProvider";
import MeetingVideo from "./MeetingVideo";

interface Props extends WebRTCUser {
  muted?: boolean;
}

function MeetingParticipantVideo({ stream, muted, user_id }: Props) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const isAudioOnly = React.useMemo(
    () =>
      stream.getTracks().length === 1 && stream.getTracks()[0].kind === "audio",
    [stream],
  );

  React.useEffect(() => {
    if (isAudioOnly) {
      audioRef.current.srcObject = stream;
      audioRef.current.autoplay = stream.active;
      audioRef.current.volume = 1;
      console.log(audioRef);
    }

    if (ref.current) {
      ref.current.srcObject = stream;
      ref.current.autoplay = stream.active;
      ref.current.muted = muted;
    }
  }, [stream, muted]);

  return (
    <MeetingVideo ref={ref}>
      {isAudioOnly && <audio ref={audioRef} />}
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
