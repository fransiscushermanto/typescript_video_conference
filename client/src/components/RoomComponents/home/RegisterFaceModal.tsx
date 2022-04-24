import { css, cx } from "@emotion/css";
import { CircularProgress } from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import {
  FaceDetection,
  FaceLandmarks68,
  WithFaceDescriptor,
  WithFaceLandmarks,
} from "face-api.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useFaceRecognition,
  useMediaDevices,
  useMe,
  useSocket,
  useFirebase,
} from "../../../hooks";
import { useGetRoomParticipantFaces, useStoreFace } from "../../api-hooks";
import { b64toBlob, dataURLtoFile, range } from "../../helper";
import {
  DRAW_TIME_INTERVAL,
  FACE_DESCRIPTION_MAX_RESULTS,
  MAX_FACES,
} from "../constants";
import CloseIcon from "../../../assets/close.svg";
import Webcam from "react-webcam";

interface Props {
  onClose?: () => void;
}

const styled = {
  root: css`
    padding: 2.5rem;
    @media (max-width: 400px) {
      padding: 2.5rem 1.25rem;
    }
    .modal-content {
      height: auto;
      max-width: 500px;
      position: relative;
      padding: 0 1rem;

      .btn-close {
        position: absolute;
        top: 0.625rem;
        right: 0.625rem;
        span {
          display: flex;
        }
      }
      .modal-header {
        justify-content: center;
        display: flex;
        flex-direction: column;
        padding: 1rem 0;

        .subtitle {
          font-size: 0.875rem;
        }
      }
      .modal-body {
        flex-direction: column;
        padding: 0;
        padding-bottom: 1rem;
        align-items: center;
        max-height: calc(100% - 88px);

        overflow-y: auto;

        .btn {
          border-radius: 0.875rem;
        }
        .error {
          font-size: 0.75rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .camera-wrapper {
          width: 100%;
          height: auto;

          .video-wrapper {
            position: relative;
            width: 100%;
            height: 400px;
            border-radius: 0.875rem;
            #video-canvas {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
            }
            .btn-start-video {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            video {
              width: 100%;
              height: 100%;
              aspect-ratio: 3/9;
              border-radius: 0.875rem;
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
          }

          .select-video {
            width: 100%;
          }

          .btn-save {
            &:disabled {
              background-color: white;
              color: grey;
              border-color: grey;
            }
          }
        }

        .image-info-list {
          margin-top: 0.625rem;
          width: 100%;
          .image-info {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: center;
            &:not(:last-child) {
              margin-bottom: 0.5rem;
            }

            .icon {
              display: flex;
              margin-right: 0.625rem;
              > * {
                width: 0.875rem !important;
                height: 0.875rem !important;
              }
              font-size: 0.875rem;
            }
            font-size: 0.875rem;
          }
        }
      }
    }
  `,
  stale: css`
    position: relative;
    display: flex;
    &::after {
      content: " ";
      width: 100%;
      height: 1px;
      position: absolute;
      background-color: grey;
      top: 50%;
      transform: translateY(-50%);
    }
  `,
};

const icons = {
  loading: <CircularProgress />,
  stale: <div className={styled.stale} />,
  done: <CheckCircle htmlColor="#1ECBAC" fontSize="inherit" />,
};

function RegisterFaceModal({ onClose }: Props) {
  const firebase = useFirebase();
  const [me] = useMe();
  const { room_id } = useParams<{ room_id }>();
  const socket = useSocket();

  const {
    getFullFaceDescription,
    initModels,
    drawFaceRect,
    is68FacialLandmarkLoading,
    isFeatureExtractorLoading,
    isLoadingFaceDetector,
  } = useFaceRecognition();

  const isModelReady =
    !is68FacialLandmarkLoading &&
    !isFeatureExtractorLoading &&
    !isLoadingFaceDetector;

  const { mutateAsync, isLoading: isLoadingStoreFace } = useStoreFace();

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
  const {
    data: savedImage,
    refetch: refetchGetParticipantFace,
    isFetching: isGetParticipantFaceLoading,
  } = useGetRoomParticipantFaces({ enabled: isModelReady });
  const { videoDevices, refetchUserMedia } = useMediaDevices();
  const [selectedVideoDevices, setSelectedVideoDevices] = useState<string>();
  const [localSavedImage, setLocalSavedImage] = useState<any[]>([]);
  const [imgPreview, setImagePreview] = useState<string>();
  const [imgFaceDescriptor, setImgFaceDesctiptor] = useState<Float32Array>();
  const [allowedCamera, setAllowedCamera] = useState<boolean>();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const localStreamRef = useRef<MediaStream>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 960,
          height: 720,
          facingMode: "user",
          ...(selectedVideoDevices && {
            deviceId: selectedVideoDevices,
          }),
        },
      });

      const selectedVideoDevice = localStream
        .getTracks()
        .find((track) => track.kind === "video")
        .getSettings().deviceId;

      if (selectedVideoDevice) setSelectedVideoDevices(selectedVideoDevice);

      if (!videoDevices) refetchUserMedia();
      localStreamRef.current = localStream;
      videoRef.current.srcObject = localStream;
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      setAllowedCamera(true);
    } catch (error) {
      setAllowedCamera(false);
      setErrorMessage("Please allow permission for camera!");
    }
  }, [selectedVideoDevices, videoDevices, refetchUserMedia]);

  const stopCamera = async () => {
    localStreamRef.current &&
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
  };

  const capture = useCallback(() => {
    if (
      isModelReady &&
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

      setImagePreview(screenShot);
      getFullFaceDescription(screenShot, FACE_DESCRIPTION_MAX_RESULTS)
        .then((data) => {
          if (data) {
            setImgFullDesc(data);
            setImgFaceDesctiptor(data[0]?.descriptor);
          }
        })
        .catch((e) => console.log("getFullFaceDescription", e));
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      const ctx = canvas.getContext("2d");
      drawFaceRect(imgFullDesc, ctx);
    }
  }, [isModelReady, imgFullDesc]);

  const onSave = useCallback(async () => {
    videoRef.current.pause();
    const now = new Date();
    const file = dataURLtoFile(
      imgPreview,
      `${now.getTime()}${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getMilliseconds()}${
        me.user_id
      }.jpg`,
    );

    const { metadata } = await firebase.uploadFileToStorage(
      file,
      `${room_id}/faces/${me.user_id}`,
    );

    const url = await firebase.getFileFromStorage(metadata.fullPath);

    await mutateAsync({
      room_id,
      user_id: me.user_id,
      face_description: imgFaceDescriptor.toString(),
      preview_image: url,
    });

    setLocalSavedImage((prev) => [...prev, url]);
    videoRef.current.play();
  }, [
    firebase,
    imgFaceDescriptor,
    imgPreview,
    me.user_id,
    mutateAsync,
    room_id,
  ]);

  useEffect(() => {
    if (savedImage?.length > 0 && localSavedImage.length === 0) {
      setLocalSavedImage(savedImage.map((image) => image.preview_image));
    }
  }, [localSavedImage.length, savedImage]);

  useEffect(() => {
    let interval;
    if (
      localSavedImage?.length !== MAX_FACES &&
      isModelReady &&
      !isLoadingStoreFace
    ) {
      interval = setInterval(capture, DRAW_TIME_INTERVAL);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [capture, localSavedImage, isModelReady, isLoadingStoreFace]);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    initModels();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    socket.on("GET_SAVED_IMAGE", () => {
      refetchGetParticipantFace();
    });
  }, []);

  return (
    <div className={cx(styled.root, "modal")}>
      <div className="modal-content">
        {localSavedImage?.length === MAX_FACES && (
          <div role="button" onClick={onClose} className="btn-close">
            <span>
              <img src={CloseIcon} alt="close" />
            </span>
          </div>
        )}

        <div className="modal-header">
          <h3 className="title">Face Registration Form</h3>
          <div className="subtitle">
            Please register 2 faces for your meeting attendance.
          </div>
        </div>
        <div className="modal-body">
          <div className="camera-wrapper">
            <div id="video-wrapper" className="video-wrapper">
              <Webcam
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId: selectedVideoDevices,
                  width: 960,
                  height: 720,
                }}
                ref={(e) => {
                  videoRef.current = e?.video;
                  webcamRef.current = e;
                }}
              />
              {localSavedImage?.length !== MAX_FACES && (
                <canvas ref={canvasRef} id="video-canvas" />
              )}
              {!allowedCamera && (
                <button
                  disabled={!isModelReady}
                  onClick={startCamera}
                  className="btn btn-outline-primary btn-start-video"
                >
                  Start Video
                </button>
              )}
              {(!isModelReady || imgFullDesc.length < 1) && (
                <div className="loading-wrapper">
                  <CircularProgress />
                </div>
              )}
            </div>
            {typeof allowedCamera !== "undefined" && !allowedCamera && (
              <div className="error">
                <span>{errorMessage}</span>
              </div>
            )}

            <select
              className="select-video mt-1"
              value={selectedVideoDevices}
              onChange={(e) => setSelectedVideoDevices(e.target.value)}
            >
              {videoDevices?.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
            <div>
              <span>
                Please make sure your face is <b>clearly visible</b> and{" "}
                <b>only one face in one frame</b> before you register your face.
              </span>
            </div>
            <button
              className="btn btn-primary btn-block mt-1 btn-save"
              onClick={onSave}
              disabled={
                !allowedCamera ||
                imgFullDesc.length < 1 ||
                isLoadingStoreFace ||
                isGetParticipantFaceLoading ||
                localSavedImage?.length >= MAX_FACES
              }
            >
              Save
            </button>
          </div>
          <ul className="image-info-list">
            {range(MAX_FACES).map((_, i) => {
              const currentIndex = i + 1;
              function handleIcon() {
                if (
                  ((!localSavedImage && i === 0) ||
                    localSavedImage?.length === i) &&
                  (isLoadingStoreFace || isGetParticipantFaceLoading)
                )
                  return "loading";

                if (localSavedImage?.length >= currentIndex) return "done";

                return "stale";
              }

              return (
                <li key={i} className="image-info">
                  <span className="icon">{icons[handleIcon()]}</span>
                  <span>Image {currentIndex}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RegisterFaceModal;
