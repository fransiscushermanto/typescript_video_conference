import React, { useRef, useEffect, useCallback } from "react";
import { useMeetingRoom, useRoomSocket } from "../../hooks";
import { RoomPermission } from "../Providers/MeetingRoomProvider";

interface Props {}

export const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination()) as any;
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: true });
};

export const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  }) as any;
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: true });
};

const audioTrack = createEmptyAudioTrack();
const videoTrack = createEmptyVideoTrack({ width: 640, height: 480 });
const mediaStream = new MediaStream([audioTrack, videoTrack]);

const VideoHandler: React.FC<Props> = () => {
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

  return (
    <video
      ref={localVideoRef}
      muted={true}
      id="player"
      className="video"
      autoPlay
    ></video>
  );
};

export default VideoHandler;
