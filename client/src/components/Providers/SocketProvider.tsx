import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { pushNotification } from "../helper";

const socketUrl = `${
  process.env.REACT_APP_SOCKET_URL || window.location.origin
}`;

interface Props {
  children: React.ReactNode;
}

const socket = io.connect(socketUrl);

const SocketContext = React.createContext(socket);

const SocketProvider: React.FC<Props> = ({ children }) => {
  const [notifQueue, setNotifQueue] = useState<
    { key: string; body: string; link: string }[]
  >([]);

  useEffect(() => {
    Notification.requestPermission();

    socket?.on("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", ({ type, room }) => {
      if (type === "add") {
        setNotifQueue((prev) =>
          prev.some((queue) => queue.key === room.room_id)
            ? prev
            : [
                ...prev,
                {
                  key: room.room_id,
                  body: `Room "${room?.room_name}" has new participant requesting to join`,
                  link: `${window.origin}/room/${room?.room_id}/waiting-room`,
                },
              ],
        );
      }
    });
  }, []);

  useEffect(() => {
    if (notifQueue.length > 0) {
      const _notifQueue = [...notifQueue];
      const current = _notifQueue.shift();
      pushNotification(current);
      setNotifQueue(_notifQueue);
    }
  }, [notifQueue]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
