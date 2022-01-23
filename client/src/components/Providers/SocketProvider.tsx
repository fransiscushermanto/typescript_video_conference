import React from "react";
import io from "socket.io-client";

const socketUrl = `${
  process.env.REACT_APP_SOCKET_URL || window.location.origin
}`;

interface Props {
  children: React.ReactNode;
}

const socket = io.connect(socketUrl);

const SocketContext = React.createContext(socket);

const SocketProvider: React.FC<Props> = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
