import { useCallback, useEffect, useState } from "react";

export default function useMediaDevices() {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>();
  const [audioInputDevices, setAudioInputDevices] =
    useState<MediaDeviceInfo[]>();
  const [audioOutputDevices, setAudioOutputDevices] =
    useState<MediaDeviceInfo[]>();

  const getUserMedia = useCallback(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setVideoDevices(
        devices.filter(({ kind }) => kind === "videoinput") || [],
      );
      setAudioInputDevices(
        devices.filter(({ kind }) => kind === "audioinput") || [],
      );
      setAudioOutputDevices(
        devices.filter(({ kind }) => kind === "audiooutput") || [],
      );
    });
  }, []);

  useEffect(() => {
    getUserMedia();
  }, [getUserMedia]);

  return {
    videoDevices,
    audioInputDevices,
    audioOutputDevices,
    refetchUserMedia: getUserMedia,
  };
}
