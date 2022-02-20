import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMe, useRoomSocket } from "../../hooks";
import { generateEmptyMediaTrack } from "../helper";

const servers: RTCConfiguration = {
  iceServers:
    process.env.NODE_ENV !== "production"
      ? [
          {
            urls: "stun:openrelay.metered.ca:80",
          },
          {
            urls: [
              "turn:openrelay.metered.ca:80",
              "turn:openrelay.metered.ca:443",
              "turn:openrelay.metered.ca:443?transport=tcp",
            ],
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ]
      : [
          {
            urls: ["stun:ss-turn2.xirsys.com"],
          },
          {
            username: process.env.REACT_APP_XIRSYS_TURN_USERNAME,
            credential: process.env.REACT_APP_XIRSYS_TURN_CREDENTIAL,
            urls: [
              "turn:ss-turn2.xirsys.com:80?transport=udp",
              "turn:ss-turn2.xirsys.com:3478?transport=udp",
              "turn:ss-turn2.xirsys.com:80?transport=tcp",
              "turn:ss-turn2.xirsys.com:3478?transport=tcp",
              "turns:ss-turn2.xirsys.com:443?transport=tcp",
              "turns:ss-turn2.xirsys.com:5349?transport=tcp",
            ],
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
  const videoSender = useRef<{ [user_id: string]: RTCRtpSender }>({});
  const audioSender = useRef<{ [user_id: string]: RTCRtpSender }>({});
  const pcsRef = useRef<{ [user_id: string]: RTCPeerConnection }>({});
  const [me] = useMe();
  const [room, setRoom] = useState<RoomModel>(
    JSON.parse(sessionStorage.getItem("room")) || {
      room_permission: { camera: true, microphone: true },
    },
  );
  const [participants, setParticipants] = useState<WebRTCUser[]>([]);
  const [call, setCall] = useState<CallModel>();

  const { meeting_id, room_id } = useParams<{ meeting_id; room_id }>();

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
          switch (pc.connectionState) {
            case "failed":
            case "disconnected":
              console.log(`${pc.connectionState} onconnectionstatechange`);
              pc.restartIce();
              break;

            default:
              break;
          }
          console.log("onconnectionstatechange", e, pc.connectionState);
        };

        pc.oniceconnectionstatechange = (e) => {
          switch (pc.iceConnectionState) {
            case "failed":
            case "disconnected":
              console.log(
                `${pc.iceConnectionState} oniceconnectionstatechange`,
              );
              pc.restartIce();
              break;

            default:
              break;
          }
          console.log("oniceconnectionstatechange", e, pc.iceConnectionState);
        };

        pc.onnegotiationneeded = (e) => {
          console.log("createoffer onnegotiationneeded", e);
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
            videoSender.current[participant.user_id] = pc.addTrack(
              videoTrack,
              localStreamRef.current,
            );
          }

          if (audioTrack) {
            audioSender.current[participant.user_id] = pc.addTrack(
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
              iceRestart: true,
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
        pcsRef.current[participant.user_id].removeTrack(
          audioSender.current[participant.user_id],
        );
        pcsRef.current[participant.user_id].removeTrack(
          videoSender.current[participant.user_id],
        );
        pcsRef.current[participant.user_id].close();
        delete pcsRef.current[participant.user_id];
      });
    };
  }, [roomSocket, createPeerConnection]);

  useEffect(() => {
    roomSocket?.on(
      "UPDATE_REMOTE_STREAM",
      ({
        participants,
        media,
      }: {
        participants: Participant[];
        media: "cam" | "mic";
      }) => {
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
                iceRestart: true,
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

          if (media === "cam") {
            if ((videoSender.current && !videoTrack) || !videoTrack.enabled) {
              console.log("removing video sender", audioTrack);
              pc.removeTrack(videoSender.current[participant.user_id]);
            } else {
              console.log("add video track", audioTrack);
              videoSender.current[participant.user_id] = pc.addTrack(
                videoTrack,
                localStreamRef.current,
              );
              if (audioTrack) {
                audioSender.current[participant.user_id] = pc.addTrack(
                  audioTrack,
                  localStreamRef.current,
                );
              }
            }
          }

          if (media === "mic") {
            console.log("mic", audioTrack);
            if ((audioSender.current && !audioTrack) || !audioTrack.enabled) {
              console.log("removing audio sender", videoTrack);
              pc.removeTrack(audioSender.current[participant.user_id]);
            } else {
              console.log("add audio track", videoTrack);
              audioSender.current[participant.user_id] = pc.addTrack(
                audioTrack,
                localStreamRef.current,
              );
              if (videoTrack) {
                videoSender.current[participant.user_id] = pc.addTrack(
                  videoTrack,
                  localStreamRef.current,
                );
              }
            }
          }

          console.log("senders", pc.getSenders());
          console.log("receivers", pc.getReceivers());

          // if (videoTrack) {
          //   console.log("adding video");
          //   try {
          //     const targetSender = pc
          //       .getSenders()
          //       .find((sender) => sender.track.kind === videoTrack.kind);

          //     console.log("video targetSender", targetSender, videoTrack);
          //     // targetSender.replaceTrack(videoTrack);

          //     // videoSender.current = pc.addTrack(
          //     //   videoTrack,
          //     //   localStreamRef.current,
          //     // );
          //   } catch (error) {
          //     try {
          //       pc.removeTrack(videoSender.current);
          //       videoSender.current = pc.addTrack(
          //         videoTrack,
          //         localStreamRef.current,
          //       );
          //     } catch (error) {
          //       console.log("adding video 2 err", error);
          //     }
          //     console.log("adding video err", error);
          //   }
          // } else {
          //   videoSender.current = undefined;
          // }

          // if (audioTrack) {
          //   console.log("adding audio");
          //   try {
          //     const targetSender = pc
          //       .getSenders()
          //       .find((sender) => sender.track.kind === audioTrack.kind);

          //     console.log("audio targetSender", targetSender, audioTrack);
          //     targetSender.replaceTrack(audioTrack);
          //     // audioSender.current = pc.addTrack(
          //     //   audioTrack,
          //     //   localStreamRef.current,
          //     // );
          //   } catch (error) {
          //     try {
          //       pc.removeTrack(audioSender.current);
          //       audioSender.current = pc.addTrack(
          //         audioTrack,
          //         localStreamRef.current,
          //       );
          //     } catch (error) {
          //       console.log("adding audio 2 err", error);
          //     }
          //     console.log("adding audio err", error);
          //   }
          // } else {
          //   audioSender.current = undefined;
          // }
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
