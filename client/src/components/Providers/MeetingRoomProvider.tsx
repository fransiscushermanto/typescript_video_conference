import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMe, useRoomSocket } from "../../hooks";
import useCallbackRef from "../../hooks/use-callback-ref";
import { generateEmptyMediaTrack } from "../helper";

const servers = {
  iceServers: [
    {
      // urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
      urls: "stun:stun.l.google.com:19302",
    },
  ],
  // iceCandidatePoolSize: 10,
};

interface Props {
  children: React.ReactNode;
}

enum ParticipantType {
  HOST = "host",
  CO_HOST = "co-host",
  PARTICIPANT = "participant",
}

export interface Participant {
  user_id?: string;
  user_name?: string;
  socket_id?: string;
  status?: ParticipantType | string;
}

interface RTCIncomingOffer extends Omit<Participant, "socket_id"> {
  sdp: RTCSessionDescription;
}
interface RTCIncomingCandidate extends Omit<Participant, "socket_id"> {
  candidate: RTCIceCandidate;
}

export interface RoomPermission {
  camera?: boolean;
  microphone?: boolean;
}

interface RoomModel {
  room_id?: string;
  room_password?: string;
  room_host?: string;
  room_participants?: Participant[];
  room_name?: string;
  room_permission?: RoomPermission;
}

interface CallModel {
  from?: any;
  name?: string;
  signal?: any;
}

export interface WebRTCUser extends Participant {
  stream: MediaStream;
}

interface ContextType {
  roomState: [RoomModel, React.Dispatch<React.SetStateAction<RoomModel>>];
  participantsState: [
    MediaStream | any | undefined,
    React.Dispatch<React.SetStateAction<WebRTCUser[]>>,
  ];
  localVideoRef: React.MutableRefObject<HTMLVideoElement>;
  localStreamRef: React.MutableRefObject<MediaStream>;
  callState: [CallModel, React.Dispatch<React.SetStateAction<CallModel>>];
}

export const videoConstraints = {
  width: { min: 640, ideal: 960, max: 1920 },
  height: { min: 576, ideal: 720, max: 1080 },
  facingMode: "user",
};

const MeetingRoomContext = React.createContext<ContextType>({
  roomState: [
    {
      room_permission: {
        camera: true,
        video: true,
      },
    } as RoomModel,
    () => {},
  ],
  participantsState: [[], () => {}],
  localStreamRef: { current: undefined },
  localVideoRef: { current: undefined },
  callState: [{}, () => {}],
});

const emptyMediaStream = generateEmptyMediaTrack();

const MeetingRoomProvider: React.FC<Props> = ({ children }) => {
  const roomSocket = useRoomSocket();

  const localStreamRef = useRef<MediaStream>();
  const localVideoRef = useRef<HTMLVideoElement>();
  const videoSender = useRef<RTCRtpSender>();
  const audioSender = useRef<RTCRtpSender>();
  const [me] = useMe();
  const [room, setRoom] = useState<RoomModel>(
    JSON.parse(sessionStorage.getItem("room")) || {
      room_permission: { camera: true, microphone: true },
    },
  );
  const [participants, setParticipants] = useState<WebRTCUser[]>([]);
  const [call, setCall] = useState<CallModel>();

  const { meeting_id, room_id } = useParams<{ meeting_id; room_id }>();
  const pcsRef = useRef<{ [user_id: string]: RTCPeerConnection }>({});

  const getLocalStream = React.useCallback(async () => {
    try {
      console.log("getLocalStream");
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: videoConstraints,
      });
      console.log("stream local", localStream.getTracks());
      localStreamRef.current = localStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.autoplay = true;
        localVideoRef.current.muted = true;
      }
    } catch (error) {
      localStreamRef.current = emptyMediaStream;
      setRoom({
        ...room,
        room_permission: {
          microphone: false,
          camera: false,
        },
      });
      console.log("getLocalStream", error);
    }
    roomSocket?.emit("JOIN_MEETING_ROOM", {
      room_id,
      meeting_id,
      me,
    });
  }, [roomSocket]);

  const createPeerConnection = React.useCallback(
    (participant: Participant) => {
      try {
        console.log("createPeerconnection");
        const pc = new RTCPeerConnection(servers);

        pc.onicecandidate = (e) => {
          if (!(roomSocket && e.candidate)) return;
          console.log("onicecandidate", participant.user_id);
          roomSocket?.emit("RTC_CANDIDATE", {
            candidate: e.candidate,
            ...me,
            candidateReceiveID: participant.user_id,
          });
        };

        pc.onconnectionstatechange = (e) => {
          console.log("onconnectionstatechange", e);
        };

        pc.oniceconnectionstatechange = (e) => {
          console.log("oniceconnectionstatechange", e);
        };

        pc.ontrack = (e) => {
          console.log("createPeerconnection ontrack success", e.streams);
          setParticipants((prev) =>
            prev
              .filter(
                (prevParticipant) =>
                  prevParticipant.user_id !== participant.user_id,
              )
              .concat({
                user_id: participant.user_id,
                user_name: participant.user_name,
                stream: e.streams[0],
              }),
          );
        };
        if (localStreamRef.current) {
          console.log("localstream add", localStreamRef.current);
          if (!localStreamRef.current) return;
          // pc.addTrack(track, localStreamRef.current);
          const videoTrack = localStreamRef.current?.getVideoTracks?.()[0];
          const audioTrack = localStreamRef.current?.getAudioTracks?.()[0];
          console.log("localStreamRef track", videoTrack);
          console.log("localStreamRef track", audioTrack);

          if (videoTrack) {
            videoSender.current = pc.addTrack(
              videoTrack,
              localStreamRef.current,
            );
          }

          if (audioTrack) {
            audioSender.current = pc.addTrack(
              audioTrack,
              localStreamRef.current,
            );
          }
        } else {
          console.log("no local stream");
        }

        return pc;
      } catch (error) {
        console.log("createOffer", error);
        return undefined;
      }
    },
    [me, roomSocket],
  );

  useEffect(() => {
    if (roomSocket) {
      getLocalStream();
    }
  }, [roomSocket]);

  useEffect(() => {
    roomSocket?.on(
      "ALL_PARTICIPANTS",
      ({ participants }: { participants: Participant[] }) => {
        console.log("map_particiapnt");
        participants?.forEach(async (participant) => {
          const pc = createPeerConnection(participant);
          console.log("pc", pc);
          if (!(pc && roomSocket)) return;
          pcsRef.current = { ...pcsRef.current, [participant.user_id]: pc };
          try {
            console.log("start createoffer");
            const localSdp = await pc.createOffer({
              offerToReceiveVideo: true,
              offerToReceiveAudio: true,
            });
            console.log("create offer success", participant.user_id);
            await pc.setLocalDescription(new RTCSessionDescription(localSdp));
            roomSocket.emit("RTC_OFFER", {
              sdp: localSdp,
              offerReceiveID: participant.user_id,
              ...me,
            });
          } catch (error) {
            console.log("ALL_PARTICIPANTS", error);
          }
        });
      },
    );
  }, [roomSocket, createPeerConnection, me]);

  useEffect(() => {
    roomSocket?.on(
      "RTC_GET_OFFER",
      async ({ sdp, ...resOffer }: RTCIncomingOffer) => {
        console.log("getoffer");
        const pc = createPeerConnection(resOffer);
        console.log("pc", pc, pcsRef.current[resOffer.user_id]);
        if (!(pc && roomSocket)) return;
        pcsRef.current = { ...pcsRef.current, [resOffer.user_id]: pc };
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log("answer set remote description success");
          const localSdp = await pc.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
          await pc.setLocalDescription(new RTCSessionDescription(localSdp));
          roomSocket.emit("RTC_ANSWER", {
            sdp: localSdp,
            answerReceiveID: resOffer.user_id,
            ...me,
          });
        } catch (error) {
          console.log("RTC_GET_OFFER", error);
        }
      },
    );

    roomSocket?.on(
      "RTC_GET_OFFER_NEGOTIATION",
      async ({ sdp, ...resOfferNegotiation }) => {
        try {
          console.log("getoffernegotiation", sdp);
          const pc = pcsRef.current[resOfferNegotiation.user_id];
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log("reanswer set remote description success");
          const localSdp = await pc.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
          console.log("create reanswer success");
          await pc.setLocalDescription(new RTCSessionDescription(localSdp));
          console.log("success setlocal reanswer description");
          roomSocket.emit("RTC_ANSWER_NEGOTIATION", {
            sdp: localSdp,
            answerNegotiationID: resOfferNegotiation.user_id,
            ...me,
          });
        } catch (error) {
          console.log("getoffernegotiation error", error);
        }
      },
    );

    roomSocket?.on(
      "RTC_GET_ANSWER_NEGOTIATION",
      async ({ sdp, ...resAnswerNegotiation }) => {
        try {
          console.log("getanswernegotiation");
          const pc: RTCPeerConnection =
            pcsRef.current[resAnswerNegotiation.user_id];

          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log("success reset remote sdp");
        } catch (error) {
          console.log("answernegotiation error", error);
        }
      },
    );

    roomSocket?.on(
      "RTC_GET_ANSWER",
      ({ sdp, ...resAnswer }: RTCIncomingOffer) => {
        console.log("getanswer");
        const pc: RTCPeerConnection = pcsRef.current[resAnswer.user_id];
        if (!pc) return;
        pc.setRemoteDescription(new RTCSessionDescription(sdp));
      },
    );

    roomSocket?.on(
      "RTC_GET_CANDIDATE",
      async ({ candidate, ...resCandidate }: RTCIncomingCandidate) => {
        console.log("get candidate");
        const pc: RTCPeerConnection = pcsRef.current[resCandidate.user_id];
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("candidate add success");
      },
    );

    roomSocket?.on("PARTICIPANT_LEAVE", ({ user_id }) => {
      console.log("leave", user_id);
      if (!pcsRef.current[user_id]) return;
      pcsRef.current[user_id].close();
      delete pcsRef.current[user_id];
      setParticipants((prev) =>
        prev.filter((participant) => participant.user_id !== user_id),
      );
    });
    return () => {
      if (roomSocket) {
        roomSocket.disconnect();
      }
      participants.forEach((participant) => {
        console.log("bye", pcsRef.current[participant.user_id]);
        if (!pcsRef.current[participant.user_id]) return;
        pcsRef.current[participant.user_id].removeTrack(audioSender.current);
        pcsRef.current[participant.user_id].removeTrack(videoSender.current);
        pcsRef.current[participant.user_id].close();
        delete pcsRef.current[participant.user_id];
      });
    };
  }, [roomSocket, createPeerConnection]);

  useEffect(() => {
    roomSocket?.on(
      "UPDATE_REMOTE_STREAM",
      ({ participants }: { participants: Participant[] }) => {
        participants.forEach(async (participant) => {
          const pc = pcsRef.current[participant.user_id];
          console.log(pcsRef.current, participant.user_id, pc);
          pc.ontrack = (e) => {
            console.log("update ontrack success", e);
            setParticipants((prev) =>
              prev
                .filter(
                  (prevParticipant) =>
                    prevParticipant.user_id !== participant.user_id,
                )
                .concat({
                  user_id: participant.user_id,
                  user_name: participant.user_name,
                  stream: e.streams[0],
                }),
            );
          };
          pc.onnegotiationneeded = async (e) => {
            try {
              console.log("onnegotiationneeded", e);
              const localSdp = await pc.createOffer({
                offerToReceiveVideo: true,
                offerToReceiveAudio: true,
              });
              await pc.setLocalDescription(new RTCSessionDescription(localSdp));
              console.log("success setLocal renegotiate");
              roomSocket.emit("RTC_OFFER_NEGOTIATION", {
                sdp: localSdp,
                receiverNegotiationID: participant.user_id,
                ...me,
              });
            } catch (error) {
              console.log("onnegotiationneeded error", e);
            }
          };
          const videoTrack = localStreamRef.current?.getVideoTracks?.()[0];
          const audioTrack = localStreamRef.current?.getAudioTracks?.()[0];
          if (videoSender.current) {
            pc.removeTrack(videoSender.current);
          }
          if (audioSender.current) {
            pc.removeTrack(audioSender.current);
          }

          if (videoTrack) {
            videoSender.current = pc.addTrack(
              videoTrack,
              localStreamRef.current,
            );
          } else {
            videoSender.current = undefined;
          }

          if (audioTrack) {
            audioSender.current = pc.addTrack(
              audioTrack,
              localStreamRef.current,
            );
          } else {
            audioSender.current = undefined;
          }
        });
      },
    );
  }, [roomSocket, me]);

  return (
    <MeetingRoomContext.Provider
      value={{
        localStreamRef,
        localVideoRef,
        roomState: [room, setRoom],
        participantsState: [participants, setParticipants],
        callState: [call, setCall],
      }}
    >
      {children}
    </MeetingRoomContext.Provider>
  );
};

export { MeetingRoomProvider, MeetingRoomContext };
