import React from "react";
import VideoSVG from "../../assets/video-call.svg";
import NoVideoSVG from "../../assets/no-video-call.svg";
import MicrophoneSVG from "../../assets/microphone.svg";
import NoMicrophoneSVG from "../../assets/no-microphone.svg";
import { MessageContext } from "../Providers/MessageProvider";
import { Severities } from "../CustomSnackbar";

const RoomFooter = () => {
  const [messages, setMessages] = React.useContext(MessageContext);
  // const [permission, setPermission] = roomPermission;

  const onClick = async (target: "mic" | "cam") => {
    const access = await navigator.permissions.query({
      name: (target === "mic" ? "microphone" : "camera") as PermissionName,
    });
    switch (target) {
      case "cam":
        // setPermission({
        //   ...permission,
        //   camera: !permission.camera,
        // });
        if (access.state === "denied") {
          setMessages([
            ...messages,
            {
              id: Date.now(),
              message: "Please allow camera in this page to access camera.",
              severity: Severities.ERROR,
            },
          ]);
        }
        break;
      case "mic":
        // setPermission({
        //   ...permission,
        //   microphone: !permission.microphone,
        // });
        if (access.state === "denied") {
          setMessages([
            ...messages,
            {
              id: Date.now(),
              message:
                "Please allow microphone in this page to access microphone.",
              severity: Severities.ERROR,
            },
          ]);
        }
        break;
      default:
        break;
    }
  };

  return (
    <footer>
      <div className="audio-wrapper">
        <div role="button" onClick={() => onClick("mic")}>
          {/* <div className="image-wrapper">
            <img
              src={permission.microphone ? MicrophoneSVG : NoMicrophoneSVG}
              alt=""
            />
          </div>
          <span>{permission.microphone ? "Mute" : "Unmute"}</span> */}
        </div>
      </div>
      <div className="camera-wrapper">
        <div role="button" onClick={() => onClick("cam")}>
          {/* <div className="image-wrapper">
            <img src={permission.camera ? VideoSVG : NoVideoSVG} alt="" />
          </div>
          <span>{permission.camera ? "Stop Video" : "Start Video"}</span> */}
        </div>
      </div>
      <div className="btn-leave-wrapper">
        <button className="btn-leave">Leave</button>
      </div>
    </footer>
  );
};

export default RoomFooter;
