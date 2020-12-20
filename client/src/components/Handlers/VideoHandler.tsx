import React, {
  useRef,
  useEffect,
  useContext,
  useCallback,
  useState,
} from "react";
import { Severities } from "../CustomSnackbar";
import { MessageContext } from "../Providers/MessageProvider";
import { SocketContext } from "../Providers/SocketProvider";

interface Props {
  connectToNewUser: (peerId: string, stream: MediaStream) => void;
}

export const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination()) as any;
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

export const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  }) as any;
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

const audioTrack = createEmptyAudioTrack();
const videoTrack = createEmptyVideoTrack({ width: 640, height: 480 });
const mediaStream = new MediaStream([audioTrack, videoTrack]);

const VideoHandler: React.FC<Props> = ({ connectToNewUser }) => {
  const [stream, setStream] = useState<MediaStream>(mediaStream as MediaStream);
  const { socket } = useContext(SocketContext);
  const videoRef = useRef() as any;
  // const startVideo = useCallback(
  //   async (permissionType: "mic" | "cam"): Promise<void> => {
  //     try {
  //       const video_stream: MediaStream =
  //         await navigator.mediaDevices.getUserMedia({
  //           video: permission.camera && { facingMode: "user" },
  //           audio: permission.microphone,
  //         });
  //       setStream(video_stream);
  //       videoRef.current.srcObject = video_stream;
  //       videoRef.current.muted = true;
  //     } catch (error) {
  //       setPermission(
  //         permissionType === "mic"
  //           ? { ...permission, microphone: false }
  //           : { ...permission, camera: false },
  //       );
  //     }
  //   },
  //   [permission, setPermission],
  // );

  useEffect(() => {
    socket.on("WELCOME", ({ new_peer_id }) => {
      connectToNewUser(new_peer_id, stream);
    });
  }, [socket, stream]);

  // useEffect(() => {
  //   startVideo("cam");
  // }, [permission.camera, socket]);

  // useEffect(() => {
  //   startVideo("mic");
  // }, [permission.microphone, socket]);

  // useEffect(() => {
  //   if (!permission.camera) {
  //     if (videoRef.current.srcObject) {
  //       (function stopVideo() {
  //         const video_stream = videoRef.current.srcObject;
  //         const tracks: MediaStreamTrack[] = video_stream.getTracks();
  //         tracks.forEach((track) => {
  //           track.stop();
  //         });

  //         videoRef.current.srcObject = null;
  //       })();
  //     }
  //   }
  // }, [permission]);

  return <video ref={videoRef} muted={true} id="player" autoPlay></video>;
};

export default VideoHandler;
