import React, { useCallback, useEffect } from "react";
import VideoSVG from "../../../assets/video-call.svg";
import NoVideoSVG from "../../../assets/no-video-call.svg";
import MicrophoneSVG from "../../../assets/microphone.svg";
import NoMicrophoneSVG from "../../../assets/no-microphone.svg";
import { MessageContext } from "../../Providers/MessageProvider";
import { Severities } from "../../CustomSnackbar";
import { useMeetingRoom, useRoomSocket } from "../../../hooks";
import {
  videoConstraints,
  MeetingRoomPermissionModel,
} from "../../Providers/MeetingRoomProvider";
import { generateEmptyMediaTrack } from "../../helper";
import { useHistory } from "react-router-dom";

const emptyMediaTrack = generateEmptyMediaTrack();

const MeetingRoomFooter = () => {
  const history = useHistory();
  const [messages, setMessages] = React.useContext(MessageContext);
  const roomSocket = useRoomSocket();
  const {
    localStreamRef,
    localVideoRef,
    meetingRoomPermissionState: [
      meetingRoomPermission,
      setMeetingRoomPermission,
    ],
  } = useMeetingRoom();
  const permission = React.useMemo(
    () => ({ ...meetingRoomPermission }),
    [meetingRoomPermission],
  );

  const setPermission = useCallback(
    (_permission: MeetingRoomPermissionModel) => {
      setMeetingRoomPermission((prev) => _permission);
    },
    [setMeetingRoomPermission],
  );

  const updateStream = useCallback(
    async (permissionType?: "mic" | "cam"): Promise<void> => {
      try {
        const video_stream: MediaStream =
          await navigator.mediaDevices.getUserMedia({
            video:
              permissionType === "cam"
                ? !permission.camera && videoConstraints
                : permission.camera && videoConstraints,
            audio:
              permissionType === "mic"
                ? !permission.microphone && true
                : permission.microphone,
          });
        localStreamRef.current = video_stream;
        localVideoRef.current.srcObject = video_stream;
        localVideoRef.current.muted = true;
        setPermission({
          ...permission,
          ...(permissionType === "cam" && { camera: !permission.camera }),
          ...(permissionType === "mic" && {
            microphone: !permission.microphone,
          }),
        });
        roomSocket.emit("LOCAL_STREAM_UPDATE", { media: permissionType });
      } catch (error) {
        console.log("update media", error);
        setPermission({
          microphone: false,
          camera: false,
        });
        localStreamRef.current = emptyMediaTrack;
        localVideoRef.current.srcObject = null;
        localVideoRef.current.muted = true;
        roomSocket.emit("LOCAL_STREAM_UPDATE", { media: permissionType });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permission, setPermission, roomSocket],
  );

  async function onClick(target: "mic" | "cam") {
    await updateStream(target);
    try {
      const access = await navigator.permissions.query({
        name: (target === "mic" ? "microphone" : "camera") as PermissionName,
      });
      const strMedia = target === "mic" ? "microphone" : "camera";
      if (access.state === "denied") {
        setMessages([
          ...messages,
          {
            id: Date.now(),
            message: `Please allow ${strMedia} in this page to access ${strMedia}.`,
            severity: Severities.ERROR,
          },
        ]);
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <footer>
      <div className="audio-wrapper">
        <div role="button" onClick={() => onClick("mic")}>
          <div className="image-wrapper">
            <img
              src={permission?.microphone ? MicrophoneSVG : NoMicrophoneSVG}
              alt=""
            />
          </div>
          <span>{permission?.microphone ? "Mute" : "Unmute"}</span>
        </div>
      </div>
      <div className="camera-wrapper">
        <div role="button" onClick={() => onClick("cam")}>
          <div className="image-wrapper">
            <img src={permission?.camera ? VideoSVG : NoVideoSVG} alt="" />
          </div>
          <span>{permission?.camera ? "Stop Video" : "Start Video"}</span>
        </div>
      </div>
      <div className="btn-leave-wrapper">
        <button className="btn-leave" onClick={() => history.goBack()}>
          Leave
        </button>
      </div>
    </footer>
  );
};

export default MeetingRoomFooter;
