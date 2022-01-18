import React, { useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
}

enum ParticipantType {
  HOST = "host",
  CO_HOST = "co-host",
  PARTICIPANT = "participant",
}

interface Participants {
  user_id?: string;
  user_name?: string;
  room_id?: string;
  socket_id?: string;
  status?: ParticipantType | string;
}

interface RoomPermission {
  camera?: boolean;
  microphone?: boolean;
}

interface RoomModel {
  room_id?: string;
  room_password?: string;
  room_host?: string;
  room_participants?: Participants[];
  room_name?: string;
  room_permission?: RoomPermission;
}

export interface UserModel {
  user_id?: string;
  user_name?: string;
  socket_id?: string;
  peer_id?: string;
}

interface CallModel {
  from?: any;
  name?: string;
  signal?: any;
}

interface ContextType {
  roomState: [RoomModel, React.Dispatch<React.SetStateAction<RoomModel>>];
  meState: [UserModel, React.Dispatch<React.SetStateAction<UserModel>>];
  streamState: [
    MediaStream | any | undefined,
    React.Dispatch<React.SetStateAction<MediaStream[]>>,
  ];
  myVideoRef: any;
  participantVideoRef: any;
  callState: [CallModel, React.Dispatch<React.SetStateAction<CallModel>>];
}

const RoomContext = React.createContext<ContextType>({
  roomState: [{} as RoomModel, () => {}],
  meState: [{} as UserModel, () => {}],
  streamState: [[], () => {}],
  myVideoRef: null,
  participantVideoRef: null,
  callState: [{}, () => {}],
});

const RoomProvider: React.FC<Props> = ({ children }) => {
  const [room, setRoom] = useState<RoomModel>(
    JSON.parse(sessionStorage.getItem("room")),
  );

  const [me, setMe] = useState<UserModel>();
  const [stream, setStream] = useState<MediaStream[]>();
  const [call, setCall] = useState<CallModel>();

  const myVideoRef = useRef<any>(null);
  const participantVideoRef = useRef<any>(null);

  return (
    <RoomContext.Provider
      value={{
        roomState: [room, setRoom],
        meState: [me, setMe],
        streamState: [stream, setStream],
        callState: [call, setCall],
        myVideoRef,
        participantVideoRef,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export { RoomProvider, RoomContext };
