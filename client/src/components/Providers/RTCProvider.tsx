import React from "react";

interface Props {
  children: React.ReactNode;
}

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
const RTCContext = React.createContext<RTCPeerConnection>(pc);

function RTCProvider({ children }: Props) {
  return <RTCContext.Provider value={pc}>{children}</RTCContext.Provider>;
}

export { RTCProvider, RTCContext };
