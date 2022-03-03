import { css, cx } from "@emotion/css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useFaceRecognition,
  useMe,
  useMediaDevices,
  useMeetingRoom,
} from "../../../hooks";
import VideoSVG from "../../../assets/video-call.svg";
import NoVideoSVG from "../../../assets/no-video-call-white.svg";
import MicrophoneSVG from "../../../assets/microphone.svg";
import NoMicrophoneSVG from "../../../assets/no-microphone-white.svg";
import { MessageContext } from "../../Providers/MessageProvider";
import { Severities } from "../../CustomSnackbar";
import {
  b64toBlob,
  dataURLtoFile,
  formatTimeDurationToReadableFormat,
  generateEmptyMediaTrack,
} from "../../helper";
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
import {
  useGetMeetingRoomInfo,
  useGetParticipantMeetingAttendance,
  useGetRoomParticipantFaces,
  useGetRoomParticipants,
  useStoreParticipantAttendance,
} from "../../api-hooks";
import { useParams } from "react-router-dom";
import useFirebase from "./../../../hooks/use-firebase";

interface Props {
  onJoin: () => void;
}

const styled = {
  root: css`
    display: flex;
    flex-direction: row;
    justify-content: center;
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

        .attendance-warning {
          margin-bottom: 1.25rem;
          text-align: center;
          p {
            margin: 0;
          }
        }
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
  const firebase = useFirebase();
  const [me] = useMe();
  const { room_id, meeting_id } = useParams<{ room_id; meeting_id }>();
  const [messages, setMessages] = React.useContext(MessageContext);
  const {
    selectedMediaDevicesState: [selectedMediaDevices, setSelectedMediaDevices],
    meetingRoomPermissionState: [
      meetingRoomPermissions,
      setMeetingRoomPermissions,
    ],
  } = useMeetingRoom();

  const [isAttendanceExpired, setIsAttendanceExpired] =
    useState<boolean>(false);
  const [strAttendanceDuration, setStrAttendanceDuration] =
    useState<string>("");
  const [stopDetection, setStopDetection] = useState<boolean>(false);
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

  const { participants } = useGetRoomParticipants();
  const { data: meetingInfo } = useGetMeetingRoomInfo(
    { room_id, meeting_id },
    { enabled: true },
  );
  const { data: faces } = useGetRoomParticipantFaces({ enabled: true });
  const { data: participantMeetingAttendance } =
    useGetParticipantMeetingAttendance({ enabled: true });

  const { mutateAsync } = useStoreParticipantAttendance();

  const {
    getFullFaceDescription,
    initModels,
    drawRectAndLabelFace,
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
          width: { min: 640, ideal: 740, max: 1920 },
          height: { min: 360, ideal: 416, max: 1080 },
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
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.muted = true;
        }
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

      const screenshot = webcam.getScreenshot({
        width: video.videoWidth,
        height: video.videoHeight,
      });

      getFullFaceDescription(screenshot, FACE_DESCRIPTION_MAX_RESULTS)
        .then((data) => {
          setImgFullDesc(data);
        })
        .catch((e) => console.log("getFullFaceDescription", e));
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      const ctx = canvas.getContext("2d");
      drawRectAndLabelFace(imgFullDesc, faceMatcher, ctx);

      if (imgFullDesc?.length > 0) {
        imgFullDesc.forEach(async (desc) => {
          const bestMatch = faceMatcher?.findBestMatch(desc.descriptor);
          if ((bestMatch as any)._label !== "unknown") {
            setStopDetection(true);
            const now = new Date();
            const file = dataURLtoFile(
              screenshot,
              `${now.getTime()}${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getMilliseconds()}${
                me.user_id
              }.jpg`,
            );

            const { metadata } = await firebase.uploadFileToStorage(
              file,
              `${room_id}/meetings/${meeting_id}`,
            );

            await mutateAsync({
              room_id,
              meeting_id,
              user_id: me.user_id,
              preview_image: metadata.fullPath,
            });
            setMessages([
              ...messages,
              {
                id: Date.now(),
                message: "Your attendance have been recorded.",
                severity: Severities.SUCCESS,
              },
            ]);
          }
        });
      }
    }
  }, [modelLoaded, imgFullDesc, faceMatcher, participants]);

  const changeCameraDevice = useCallback(async () => {
    try {
      const videoConstraint = {
        width: { min: 640, ideal: 740, max: 1920 },
        height: { min: 360, ideal: 416, max: 1080 },
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

  const stopCamera = async () => {
    localStreamRef.current &&
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
  };

  useEffect(() => {
    async function matcher() {
      if (faces) {
        const roomFacesList = await createMatcher(faces, MATCHING_THRESHOLD);
        setFaceMatcher(roomFacesList);
      }
    }
    if (faces) {
      matcher();
    }
  }, [faces]);

  useEffect(() => {
    let interval;
    if (!stopDetection) {
      interval = setInterval(capture, DRAW_TIME_INTERVAL);
    } else {
      setStopDetection(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [capture, stopDetection]);

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
    startDevice("both");

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isAttendanceExpired && !participantMeetingAttendance) {
      initModels();
    } else {
      setStopDetection(true);
    }
  }, [isAttendanceExpired, participantMeetingAttendance]);

  useEffect(() => {
    let interval;
    if (meetingInfo) {
      interval = setInterval(() => {
        setStrAttendanceDuration(
          formatTimeDurationToReadableFormat({
            start: new Date(),
            end: new Date(meetingInfo.attendance_finish_at),
            format: ["days", "hours", "minutes", "seconds"],
          }),
        );
        setIsAttendanceExpired(
          new Date() >= new Date(meetingInfo.attendance_finish_at),
        );
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [meetingInfo]);

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
        <div className="attendance-warning">
          {!isAttendanceExpired ? (
            <p>
              Attendance will expire in{" "}
              <b>
                {strAttendanceDuration !== ""
                  ? strAttendanceDuration
                  : "xx hour(s) xx minute(s) xx second(s)"}
              </b>
            </p>
          ) : (
            <p>
              Attendance is <b>expired</b>.
            </p>
          )}
        </div>
        <div className="video-wrapper">
          <Webcam
            audioConstraints={meetingRoomPermissions.microphone}
            screenshotFormat="image/jpeg"
            videoConstraints={
              meetingRoomPermissions.camera
                ? {
                    deviceId: selectedMediaDevices.video,
                    width: { min: 640, ideal: 740, max: 1920 },
                    height: { min: 360, ideal: 416, max: 1080 },
                  }
                : false
            }
            ref={(e) => {
              videoRef.current = e?.video;
              webcamRef.current = e;
            }}
          />
          {!stopDetection && <canvas ref={canvasRef} id="video-canvas" />}
          {(!modelLoaded ||
            (!stopDetection && imgFullDesc && imgFullDesc.length < 1)) && (
            <div className="loading-wrapper">
              <CircularProgress />
            </div>
          )}
          {stopDetection && (
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
          )}
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
      {stopDetection && (
        <div className="col">
          <h3 className="title">Ready To Join?</h3>
          <button className="btn btn-join btn-primary" onClick={onJoin}>
            Join Now
          </button>
        </div>
      )}
    </div>
  );
}

export default MeetingSetup;
