import { css, cx } from "@emotion/css";
import React, { useEffect, useRef, useState } from "react";
import { videoConstraints } from "../../Providers/MeetingRoomProvider";

interface Props {}

const styled = {
  root: css`
    padding: 2.5rem;
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
            height: auto;
            .btn-start-video {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            video {
              width: 100%;
              height: 100%;
              max-height: 400px;
              aspect-ratio: 3/9;
            }
          }
        }
      }
    }
  `,
};

function RegisterFaceModal({}: Props) {
  const [imgSrc, setImgSrc] = useState<string[]>([]);
  const [allowedCamera, setAllowedCamera] = useState<boolean>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
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
    video.pause();

    const canvas = Object.assign(document.createElement("canvas"), {
      width: video.videoWidth,
      height: video.videoHeight,
    }) as HTMLCanvasElement;

    canvas
      .getContext("2d")
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob((blob) => {
      const url = window.URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;
      setImgSrc((prev) => [...prev, url]);
    });

    video.play();
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className={cx(styled.root, "modal")}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="title">Please Register Your Face!</div>
        </div>
        <div className="modal-body">
          <div className="camera-wrapper">
            <div className="video-wrapper">
              <video
                onContextMenu={(e) => e.preventDefault()}
                ref={videoRef}
              ></video>
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
              className="btn btn-outline-primary btn-block"
              disabled={!allowedCamera}
            >
              Capture
            </button>
          </div>
          <ul className="image-list">
            {imgSrc.map((src) => (
              <li>{src}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RegisterFaceModal;
