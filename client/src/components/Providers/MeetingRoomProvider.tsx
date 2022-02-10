import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMe, useRoomSocket } from "../../hooks";
import useCallbackRef from "../../hooks/use-callback-ref";

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

let videoSender: RTCRtpSender, audioSender: RTCRtpSender;

const MeetingRoomProvider: React.FC<Props> = ({ children }) => {
  const roomSocket = useRoomSocket();

  const localStreamRef = useRef<MediaStream>();
  const localVideoRef = useRef<HTMLVideoElement>();
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
        video: {
          width: 500,
          height: 375,
        },
      });
      localStreamRef.current = localStream;
      console.log("current localStream", localStreamRef.current);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.autoplay = true;
        localVideoRef.current.muted = true;
      }
      console.log("roomSocket", roomSocket);
      roomSocket?.emit("JOIN_MEETING_ROOM", {
        room_id,
        meeting_id,
        me,
      });
    } catch (error) {
      console.log("getLocalStream", error);
    }
  }, [roomSocket]);

  const createPeerConnection = React.useCallback(
    (participant: Participant) => {
      try {
        console.log("createPeerconnection");
        const pc = new RTCPeerConnection(servers);
        pc.onicecandidate = (e) => {
          if (!(roomSocket && e.candidate)) return;
          console.log("onicecandidate");
          roomSocket?.emit("RTC_CANDIDATE", {
            meeting_id,
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
          console.log("ontrack success");
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
          localStreamRef.current.getTracks().forEach((track) => {
            if (!localStreamRef.current) return;
            console.log("localStreamRef.current track", track);
            // pc.addTrack(track, localStreamRef.current);
            const videoTrack = localStreamRef.current?.getVideoTracks?.()[0];
            const audioTrack = localStreamRef.current?.getAudioTracks?.()[0];

            if (videoTrack) {
              if (!videoSender) {
                videoSender = pc.addTrack(videoTrack, localStreamRef.current);
              } else {
                videoSender.replaceTrack(videoTrack);
              }
            }

            if (audioTrack) {
              if (!audioSender) {
                audioSender = pc.addTrack(audioTrack, localStreamRef.current);
              } else {
                audioSender.replaceTrack(audioTrack);
              }
            }
          });
        } else {
          console.log("no local stream");
        }

        return pc;
      } catch (error) {
        console.log("createOffer", error);
        return undefined;
      }
    },
    [me, meeting_id, roomSocket],
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
        console.log("map_particiapnt", participants);
        participants?.forEach(async (participant) => {
          console.log("localStream", localStreamRef.current);
          if (!localStreamRef.current) return;
          const pc = createPeerConnection(participant);
          console.log("pc", pc);
          if (!(pc && roomSocket)) return;
          console.log("beforeadd pc", pcsRef.current);
          pcsRef.current = { ...pcsRef.current, [participant.user_id]: pc };
          console.log("afteradd pc", pcsRef.current);
          try {
            console.log("createoffer");
            const localSdp = await pc.createOffer({
              offerToReceiveVideo: true,
              offerToReceiveAudio: true,
            });
            console.log("create offer success", participant.user_id);
            await pc.setLocalDescription(new RTCSessionDescription(localSdp));
            roomSocket.emit("RTC_OFFER", {
              meeting_id,
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
  }, [roomSocket, meeting_id, createPeerConnection, me]);

  useEffect(() => {
    roomSocket?.on(
      "UPDATE_REMOTE_STREAM",
      ({ participants }: { participants: Participant[] }) => {
        participants.forEach(async (participant) => {
          const pc = pcsRef.current[participant.user_id];
          console.log(pcsRef.current, participant.user_id, pc);
          // if (!pc) return;
          pc.ontrack = (e) => {
            console.log("ontrack success", e);
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

          if (videoSender) {
            pc.removeTrack(videoSender);
          }
          if (audioSender) {
            pc.removeTrack(audioSender);
          }

          if (videoTrack) {
            videoSender = pc.addTrack(videoTrack, localStreamRef.current);
          } else {
            videoSender = undefined;
          }
          if (audioTrack) {
            audioSender = pc.addTrack(audioTrack, localStreamRef.current);
          } else {
            audioSender = undefined;
          }
        });
      },
    );
  }, [roomSocket, me]);

  useEffect(() => {
    roomSocket?.on(
      "RTC_GET_OFFER",
      async ({ sdp, ...resOffer }: RTCIncomingOffer) => {
        console.log("getoffer");
        const pc = createPeerConnection(resOffer);
        if (!(pc && roomSocket)) return;
        console.log("getoffer beforeadd pc", pcsRef.current);
        pcsRef.current = { ...pcsRef.current, [resOffer.user_id]: pc };
        console.log("getoffer afteradd pc", pcsRef.current);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log("answer set remote description success");
          const localSdp = await pc.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
          await pc.setLocalDescription(new RTCSessionDescription(localSdp));
          roomSocket.emit("RTC_ANSWER", {
            meeting_id,
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
          console.log("getoffernegotiation");
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
        console.log("answer pc", pc);
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
        pcsRef.current[participant.user_id].removeTrack(audioSender);
        pcsRef.current[participant.user_id].removeTrack(videoSender);
        pcsRef.current[participant.user_id].close();
        delete pcsRef.current[participant.user_id];
      });
    };
  }, [roomSocket]);

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
