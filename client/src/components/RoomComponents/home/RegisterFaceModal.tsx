import { css, cx } from "@emotion/css";
import {
  FaceDetection,
  FaceLandmarks68,
  WithFaceDescriptor,
  WithFaceLandmarks,
} from "face-api.js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  drawFaceRect,
  getFullFaceDescription,
  loadModels,
} from "../../../face-recognition";

interface Props {}

const styled = {
  root: css`
    padding: 2.5rem;
    @media (max-width: 400px) {
      padding: 2.5rem 1.25rem;
    }
    .modal-content {
      height: 100%;
      .modal-header {
        justify-content: center;
      }
      .modal-body {
        flex-direction: column;
        padding-top: 0;
        align-items: center;
        max-height: calc(100% - 62px);

        overflow-y: auto;

        .error {
          font-size: 0.75rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .camera-wrapper {
          width: 100%;
          height: auto;
          max-width: 500px;

          .video-wrapper {
            position: relative;
            width: 100%;
            height: 400px;
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
            }
          }
        }
      }
    }
  `,
};

function RegisterFaceModal({}: Props) {
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
  const [modelLoaded, setModelLoaded] = useState(false);
  const [allowedCamera, setAllowedCamera] = useState<boolean>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameraDevices = devices.filter(({ kind }) => kind === "videoinput");
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 960, height: 720, deviceId: cameraDevices[0].deviceId },
      });
      videoRef.current.srcObject = localStream;
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      setAllowedCamera(true);
    } catch (error) {
      setAllowedCamera(false);
      setErrorMessage("Please allow permission for camera!");
    }
  };

  const onCapture = async () => {
    const video = videoRef.current;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas
      .getContext("2d", { alpha: false })
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob(async (blob) => {
      const url = window.URL.createObjectURL(blob);
      getFullFaceDescription(url).then((data) => setImgFullDesc(data));
      // const ctx = canvas.getContext("2d");
      // drawFaceRect(fullDesc, ctx);
    });
  };

  const capture = useCallback(() => {
    if (modelLoaded && videoRef.current.readyState === 4) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas
        .getContext("2d", { alpha: false })
        .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          getFullFaceDescription(url).then((data) => setImgFullDesc(data));
          const ctx = canvas.getContext("2d");
          drawFaceRect(imgFullDesc, ctx);
        }
      });
    }
  }, [modelLoaded, imgFullDesc]);

  useEffect(() => {
    const interval = setInterval(capture, 700);
    return () => clearInterval(interval);
  }, [capture]);

  useEffect(() => {
    (async function init() {
      await loadModels();
      startCamera();
      setModelLoaded(true);
    })();
  }, []);

  return (
    <div className={cx(styled.root, "modal")}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="title">Please Register Your Face!</div>
        </div>
        <div className="modal-body">
          <div className="camera-wrapper">
            <div id="video-wrapper" className="video-wrapper">
              <video ref={videoRef} />
              <canvas ref={canvasRef} id="video-canvas" />
              {!allowedCamera && (
                <button
                  onClick={startCamera}
                  className="btn btn-outline-primary btn-start-video"
                >
                  Start Video
                </button>
              )}
            </div>
            {typeof allowedCamera !== "undefined" && !allowedCamera && (
              <div className="error">
                <span>{errorMessage}</span>
              </div>
            )}
            <button
              onClick={onCapture}
              className="btn btn-outline-primary btn-block mt-1"
              disabled={!allowedCamera || imgFullDesc.length >= 2}
            >
              Capture
            </button>
            <ul className="image-list">
              {imgFullDesc.map((data) => (
                <li style={{ wordBreak: "break-all" }}>
                  <span>{data.descriptor.toString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterFaceModal;
