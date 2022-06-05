import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetRole, useMe, useSocket } from "../../hooks";
import { useGetUsersInWaitingRoom } from "../api-hooks";
import { SnackbarItem } from "../CustomSnackbar/types";
import { pushNotification } from "../helper";
import { menus } from "../RoomComponents/constants";

interface Props {
  children: React.ReactNode;
}

const MessageContext = React.createContext<
  [[], React.Dispatch<React.SetStateAction<SnackbarItem[]>>]
>([[], () => {}]);

const ErrorProvider: React.FC<Props> = ({ children }) => {
  const [messages, setMessages] = useState<[]>([]);
  const [notifQueue, setNotifQueue] = useState<
    { key: string; body: string; link: string }[]
  >([]);
  const { room_id } = useParams<{ room_id }>();
  const { usersInWaitingRoom } = useGetUsersInWaitingRoom(room_id, {
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const notifOnDelete = React.useMemo(
    () => usersInWaitingRoom.length === 0 && { "waiting-room": false },
    [usersInWaitingRoom],
  );

  const [me] = useMe();
  const socket = useSocket();

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
    return () => {
      socket?.off("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", () => {});
    };
  }, []);

  useEffect(() => {
    socket?.on("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", ({ type, room }) => {
      if (type === "add") {
        socket?.emit("UPDATE_ROOM_NOTIFICATION", {
          user_id: me?.user_id,
          room_id: room.room_id,
          notif: { "waiting-room": true },
        });
      } else if (type === "delete") {
        socket?.emit("UPDATE_ROOM_NOTIFICATION", {
          user_id: me?.user_id,
          room_id: room.room_id,
          notif: {
            ...notifOnDelete,
          },
        });
      }
    });
    return () => {
      socket?.off("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", () => {});
    };
  }, [me?.user_id, notifOnDelete, socket]);

  useEffect(() => {
    if (notifQueue.length > 0) {
      const _notifQueue = [...notifQueue];
      const current = _notifQueue.shift();
      pushNotification(current);
      setNotifQueue(_notifQueue);
    }
  }, [notifQueue]);

  return (
    <MessageContext.Provider value={[messages, setMessages]}>
      {children}
    </MessageContext.Provider>
  );
};

export { ErrorProvider as MessageProvider, MessageContext };
