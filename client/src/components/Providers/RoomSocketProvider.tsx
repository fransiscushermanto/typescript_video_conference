import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socketUrl = `${
  process.env.REACT_APP_SOCKET_URL || window.location.origin
}`;

interface Props {
  children: React.ReactNode;
}

const RoomSocketContext = React.createContext<SocketIOClient.Socket>(null);

const RoomSocketProvider: React.FC<Props> = ({ children }) => {
  const { room_id } = useParams<{ room_id }>();
  const [socket, setSocket] = useState<SocketIOClient.Socket>();

  const transport = React.useMemo(
    () => io.connect(`${socketUrl}/${room_id}`, { forceNew: true }),
    [room_id],
  );

  useEffect(() => {
    transport.on("connect", () => setSocket(transport));
  }, []);

  return (
    <RoomSocketContext.Provider value={socket}>
      {children}
    </RoomSocketContext.Provider>
  );
};

export { RoomSocketProvider, RoomSocketContext };
