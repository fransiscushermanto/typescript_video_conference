import React, { useEffect } from "react";
import { useRoomSocket } from "../../../hooks";
import { WebRTCUser } from "../../Providers/MeetingRoomProvider";
import MeetingVideo from "./MeetingVideo";

interface Props extends WebRTCUser {
  muted?: boolean;
}

function MeetingParticipantVideo({ stream, muted, user_id }: Props) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isAudioOnly, setIsAudioOnly] = React.useState<boolean>();

  useEffect(() => {
    setIsAudioOnly(
      stream?.getTracks().length === 1 &&
        stream?.getTracks()[0].kind === "audio",
    );
  }, [stream]);

  useEffect(() => {
    if (stream) {
      stream.onremovetrack = (e) => {
        console.log("track removed", e);
        const removedTrack = e.track;
        // console.log(removedTrack.kind, "isAudioOnly", isAudioOnly);
        if (!isAudioOnly && removedTrack.kind === "audio") {
          ref.current.muted = true;
        }

        if (removedTrack.kind === "video") {
          setIsAudioOnly(true);
          ref.current.srcObject = undefined;
          ref.current.autoplay = false;
          ref.current.muted = true;
        } else if (isAudioOnly) {
          setIsAudioOnly(false);
        }
      };
    }
  }, [stream, isAudioOnly]);

  useEffect(() => {
    if (isAudioOnly) {
      audioRef.current.srcObject = stream;
      audioRef.current.autoplay = stream?.active;
      audioRef.current.volume = 1;
    }

    if (ref.current && !isAudioOnly) {
      ref.current.srcObject = !isAudioOnly ? stream : undefined;
      ref.current.autoplay = !isAudioOnly && stream?.active;
      ref.current.muted = isAudioOnly || muted;
    }
  }, [stream, muted, isAudioOnly]);

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
