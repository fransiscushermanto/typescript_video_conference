import { css } from "@emotion/css";
import React, { useEffect } from "react";
import { WebRTCUser } from "../../Providers/MeetingRoomProvider";
import MeetingVideo from "./MeetingVideo";
import NoMicrophoneSVG from "../../../assets/no-microphone-red.svg";

interface Props extends WebRTCUser {
  muted?: boolean;
}

function MeetingParticipantVideo({ stream, muted, user_id, user_name }: Props) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isAudioOnly, setIsAudioOnly] = React.useState<boolean>();
  const [isMuted, setIsMuted] = React.useState<boolean>(false);

  useEffect(() => {
    setIsAudioOnly(
      stream?.getTracks().length === 1 &&
        stream?.getTracks()[0].kind === "audio",
    );

    setIsMuted(stream?.getAudioTracks().length < 1);
  }, [stream]);

  useEffect(() => {
    if (stream) {
      stream.onremovetrack = (e) => {
        const removedTrack = e.track;
        if (!isAudioOnly && removedTrack.kind === "audio") {
          setIsMuted(true);
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
    console.log("stream", stream.getTracks());
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
        className={css`
          position: absolute;
          background-color: rgba(0, 0, 0, 0.4);
          left: 0;
          bottom: 0;
          font-size: 0.75rem;
          padding: 0.0625rem 0.25rem;

          display: inline-flex;
          align-items: center;
          .icon {
            width: 0.875rem;
            height: 0.875rem;
            display: flex;
            align-items: center;
            justify-content: center;

            margin-right: 0.25rem;
            img {
              width: 100%;
              height: 100%;
            }
          }
        `}
      >
        {isMuted && (
          <span className="icon">
            <img src={NoMicrophoneSVG} alt="" />
          </span>
        )}
        <span>{user_name}</span>
      </div>
    </MeetingVideo>
  );
}

export default MeetingParticipantVideo;
