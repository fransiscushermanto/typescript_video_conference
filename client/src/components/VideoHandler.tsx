import React, { useRef, useEffect, useContext } from "react";
import { RoomDetailContext } from "./providers/RoomDetailProvider";

const VideoHandler: React.FC = () => {
    const { roomPermission } = useContext(RoomDetailContext);
    const [permission, setPermission] = roomPermission;

    const videoRef = useRef() as any;

    useEffect(() => {
        if (videoRef.current) {
            if (permission.camera) {
                (async function startVideo(): Promise<void> {
                    try {
                        const video_stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 1080, height: 1080 }, audio: false });
                        videoRef.current.srcObject = video_stream;

                    } catch (error) {
                        alert("Camera is not available");
                        setPermission({ ...permission, camera: false })
                    }

                })();
            } else {
                if (videoRef.current.srcObject) {
                    (function stopVideo() {
                        const video_stream = videoRef.current.srcObject;
                        const tracks: MediaStreamTrack[] = video_stream.getTracks();
                        tracks.forEach((track) => {
                            track.stop();
                        });

                        videoRef.current.srcObject = null;
                    })();
                }
            }

        }
    }, [permission, setPermission]);

    return <video ref={videoRef} id="player" autoPlay></video>;
};

export default VideoHandler;

