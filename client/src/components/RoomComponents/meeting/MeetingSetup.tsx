import { css, cx } from "@emotion/css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useFaceRecognition,
  useMediaDevices,
  useMeetingRoom,
} from "../../../hooks";
import VideoSVG from "../../../assets/video-call.svg";
import NoVideoSVG from "../../../assets/no-video-call-white.svg";
import MicrophoneSVG from "../../../assets/microphone.svg";
import NoMicrophoneSVG from "../../../assets/no-microphone-white.svg";
import { MessageContext } from "../../Providers/MessageProvider";
import { Severities } from "../../CustomSnackbar";
import { generateEmptyMediaTrack } from "../../helper";
import Webcam from "react-webcam";
import {
  DRAW_TIME_INTERVAL,
  FACE_DESCRIPTION_MAX_RESULTS,
  MATCHING_THRESHOLD,
} from "../constants";
import { CircularProgress } from "@material-ui/core";
import {
  FaceDetection,
  FaceLandmarks68,
  FaceMatcher,
  WithFaceDescriptor,
  WithFaceLandmarks,
} from "face-api.js";
import { useGetRoomFaces } from "../../api-hooks";

interface Props {
  onJoin: () => void;
}

const styled = {
  root: css`
    display: flex;
    flex-direction: row;
    height: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .col {
      display: flex;
      flex-direction: column;
      justify-content: center;

      &:first-child {
        padding: 0;
        width: 100%;
        max-width: 740px;
        height: 100%;
        .video-wrapper {
          position: relative;
          width: 100%;
          height: 416px;
          display: flex;
          margin-bottom: 0.5rem;

          #video-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }

          .video-action-wrapper {
            position: absolute;
            width: 100%;
            left: 0%;
            bottom: 0%;
            display: flex;
            flex-direction: row;

            justify-content: center;

            .center {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              .btn-media {
                margin-bottom: 1rem;
                background-color: transparent;
                transition: background-color ease-in-out 0.2s;
                &:hover {
                  background-color: rgba(255, 255, 255, 0.4);
                }
                &:not(:last-child) {
                  margin-right: 0.5rem;
                }

                &.disabled {
                  border-color: var(--red);
                  background-color: var(--red);
                }

                width: 100%;
                height: 56px;
                max-width: 56px;

                display: flex;
                justify-content: center;
                align-items: center;

                border: 1px solid white;
                border-radius: 50%;

                img {
                  width: 24px;
                  height: 24px;
                }
              }
            }
          }

          .loading-wrapper {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
          }
          video {
            width: 100%;
            height: 100%;
            border-radius: 0.625rem;
          }
        }
      }

      &:nth-child(2) {
        align-items: center;
        .title {
          font-weight: normal;
          margin-bottom: 1.25rem;
        }
        .btn-join {
          height: 48px;
          padding: 0 1.5rem;
          border-radius: 1.5rem;
        }
      }
    }
  `,
};

const emptyMediaTrack = generateEmptyMediaTrack();

function MeetingSetup({ onJoin }: Props) {
  const [messages, setMessages] = React.useContext(MessageContext);
  const {
    selectedMediaDevicesState: [selectedMediaDevices, setSelectedMediaDevices],
    meetingRoomPermissionState: [
      meetingRoomPermissions,
      setMeetingRoomPermissions,
    ],
  } = useMeetingRoom();

  const [faceMatcher, setFaceMatcher] = useState<FaceMatcher>();
  const [imgFullDesc, setImgFullDesc] = useState<
    WithFaceDescriptor<
      WithFaceLandmarks<
        {
          detection: FaceDetection;
        },
        FaceLandmarks68
      >
    >[]
  >([]);

  const { data: roomFaces } = useGetRoomFaces({ enabled: true });

  const {
    getFullFaceDescription,
    initModels,
    drawFaceRect,
    is68FacialLandmarkLoading,
    isFeatureExtractorLoading,
    isLoadingFaceDetector,
    createMatcher,
  } = useFaceRecognition();

  const { audioInputDevices, videoDevices, refetchUserMedia } =
    useMediaDevices();

  const localStreamRef = useRef<MediaStream>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const modelLoaded =
    !is68FacialLandmarkLoading &&
    !isFeatureExtractorLoading &&
    !isLoadingFaceDetector;

  const startDevice = useCallback(
    async (device: "both" | "audio" | "video") => {
      try {
        const videoConstraint = {
          width: 740,
          height: 416,
          ...(selectedMediaDevices.video && {
            deviceId: selectedMediaDevices.video,
          }),
          facingMode: "user",
        };

        const video =
          device === "both"
            ? videoConstraint
            : device === "video"
            ? !meetingRoomPermissions.camera && videoConstraint
            : meetingRoomPermissions.camera && videoConstraint;

        const audio =
          device === "both"
            ? true
            : device === "audio"
            ? !meetingRoomPermissions.microphone && true
            : meetingRoomPermissions.microphone;

        const localStream = await navigator.mediaDevices.getUserMedia({
          video,
          audio,
        });

        if (device === "video" && meetingRoomPermissions.camera) {
          localStreamRef.current?.getVideoTracks().forEach((track) => {
            track.stop();
          });
        }

        const selectedVideoDevice = localStream
          .getTracks()
          .find((track) => track.kind === "video")
          ?.getSettings().deviceId;

        if (selectedVideoDevice) {
          setSelectedMediaDevices((prev) => ({
            ...(prev && prev),
            video: selectedVideoDevice,
          }));
        }
        if (!videoDevices) refetchUserMedia();
        localStreamRef.current = localStream;
        videoRef.current.srcObject = localStream;
        videoRef.current.autoplay = true;
        videoRef.current.muted = true;

        setMeetingRoomPermissions((prev) => {
          const data = {
            ...prev,
            ...(device === "both" && { camera: true, microphone: true }),
            ...(device === "video" && {
              camera: !meetingRoomPermissions.camera,
            }),
            ...(device === "audio" && {
              microphone: !meetingRoomPermissions.microphone,
            }),
          };
          console.log(data);
          return data;
        });
      } catch (error) {
        console.log("startDevice", error);
        localStreamRef.current = emptyMediaTrack;
        videoRef.current.srcObject = null;
        videoRef.current.muted = true;
        setMeetingRoomPermissions({
          camera: false,
          microphone: false,
        });
      }
    },
    [
      localStreamRef,
      meetingRoomPermissions.camera,
      meetingRoomPermissions.microphone,
      refetchUserMedia,
      selectedMediaDevices.video,
      setMeetingRoomPermissions,
      setSelectedMediaDevices,
      videoDevices,
    ],
  );

  const capture = useCallback(() => {
    if (
      modelLoaded &&
      videoRef.current?.readyState === 4 &&
      canvasRef.current
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const webcam = webcamRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const screenShot = webcam.getScreenshot({
        width: video.videoWidth,
        height: video.videoHeight,
      });

      getFullFaceDescription(screenShot, FACE_DESCRIPTION_MAX_RESULTS)
        .then((data) => {
          setImgFullDesc(data);
        })
        .catch((e) => console.log("getFullFaceDescription", e));
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      const ctx = canvas.getContext("2d");
      drawFaceRect(imgFullDesc, ctx);

      if (imgFullDesc?.length > 0) {
        imgFullDesc.map((desc) => {
          const bestMatch = faceMatcher?.findBestMatch(desc.descriptor);
          console.log(bestMatch);
        });
      }
    }
  }, [modelLoaded, imgFullDesc]);

  const changeCameraDevice = useCallback(async () => {
    try {
      const videoConstraint = {
        width: 740,
        height: 416,
        deviceId: selectedMediaDevices.video,
      };

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: meetingRoomPermissions.microphone,
      });
      localStreamRef.current = localStream;
      videoRef.current.srcObject = localStream;
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
    } catch (error) {
      console.log("change camera error", error);
    }
  }, [selectedMediaDevices.video, meetingRoomPermissions.microphone]);

  async function onClick(target: "video" | "audio") {
    await startDevice(target);
    try {
      const access = await navigator.permissions.query({
        name: (target === "audio" ? "microphone" : "camera") as PermissionName,
      });
      const strMedia = target === "audio" ? "microphone" : "camera";
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

  useEffect(() => {
    async function matcher() {
      if (roomFaces) {
        const roomFacesList = await createMatcher(
          roomFaces,
          MATCHING_THRESHOLD,
        );
        setFaceMatcher(roomFacesList);
      }
    }
    if (roomFaces) {
      matcher();
    }
  }, [roomFaces]);

  useEffect(() => {
    let interval;
    interval = setInterval(capture, DRAW_TIME_INTERVAL);
    return () => clearInterval(interval);
  }, [capture]);

  useEffect(() => {
    if (videoDevices) {
      setSelectedMediaDevices((prev) => ({
        ...(prev && prev),
        video: videoDevices[0].deviceId,
      }));
    }
  }, []);

  useEffect(() => {
    if (audioInputDevices) {
      setSelectedMediaDevices((prev) => ({
        ...(prev && prev),
        audio: audioInputDevices[0].deviceId,
      }));
    }
  }, []);

  useEffect(() => {
    initModels();
    startDevice("both");
  }, []);

  useEffect(() => {
    if (
      selectedMediaDevices.video &&
      localStreamRef.current &&
      meetingRoomPermissions.camera
    ) {
      changeCameraDevice();
    }
  }, [
    changeCameraDevice,
    meetingRoomPermissions.camera,
    selectedMediaDevices.video,
  ]);

  return (
    <div className={styled.root}>
      <div className="col">
        <div className="video-wrapper">
          <Webcam
            audioConstraints={meetingRoomPermissions.microphone}
            screenshotFormat="image/jpeg"
            videoConstraints={
              meetingRoomPermissions.camera
                ? {
                    deviceId: selectedMediaDevices.video,
                    width: 740,
                    height: 416,
                  }
                : false
            }
            ref={(e) => {
              videoRef.current = e?.video;
              webcamRef.current = e;
            }}
          />
          <canvas ref={canvasRef} id="video-canvas" />
          {(!modelLoaded || (imgFullDesc && imgFullDesc.length < 1)) && (
            <div className="loading-wrapper">
              <CircularProgress />
            </div>
          )}
          <div className="video-action-wrapper">
            <div className="center">
              <div
                role="button"
                className={cx("btn-media", {
                  disabled: !meetingRoomPermissions.camera,
                })}
                onClick={() => onClick("video")}
              >
                <img
                  src={meetingRoomPermissions?.camera ? VideoSVG : NoVideoSVG}
                  alt=""
                />
              </div>
              <div
                role="button"
                className={cx("btn-media", {
                  disabled: !meetingRoomPermissions.microphone,
                })}
                onClick={() => onClick("audio")}
              >
                <img
                  src={
                    meetingRoomPermissions?.microphone
                      ? MicrophoneSVG
                      : NoMicrophoneSVG
                  }
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
        <select
          value={selectedMediaDevices.video}
          onChange={(e) =>
            setSelectedMediaDevices((prev) => ({
              ...(prev && prev),
              video: e.target.value,
            }))
          }
        >
          {videoDevices?.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col">
        <h3 className="title">Ready To Join?</h3>
        <button className="btn btn-join btn-primary" onClick={onJoin}>
          Join Now
        </button>
      </div>
    </div>
  );
}

export default MeetingSetup;
