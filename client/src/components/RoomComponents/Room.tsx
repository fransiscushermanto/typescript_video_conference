import Peer from "peerjs";
import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../Providers/SocketProvider";
import RoomFooter from "./RoomFooter";
import RoomHeader from "./RoomHeader";
import RoomMain from "./RoomMain";
import axios from "../../axios-instance";
import { Severities } from "../CustomSnackbar";
import { MessageContext } from "../Providers/MessageProvider";

interface Props {
  status: string;
}

const Room: React.FC<Props> = ({ status }) => {
  const [messages, setMessages] = useContext(MessageContext);
  const { socket } = React.useContext(SocketContext);

  const updateRoom = async (data: {
    room_id: string;
    room_host: string;
    room_password: string;
  }): Promise<void> => {
    await axios.post("/api/updateRoom", data);
  };

  useEffect(() => {
    switch (status) {
      case "join":
        // setDetails({
        //   ...details,
        //   user: { ...details.user, user_id: socket.id, socket_id: socket.id },
        // });
        // myPeer.connect()
        break;
      case "start":
        break;
      default:
        break;
    }
  }, [status]);

  // useEffect(() => {
  //   socket.on("WELCOME", ({ message, room_participants }) => {
  //     console.log("welcome user", details);
  //     setMessages([
  //       ...messages,
  //       {
  //         id: Date.now(),
  //         message: message,
  //         severity: Severities.INFO,
  //       },
  //     ]);
  //     const data = {
  //       user: { ...details.user, socket_id: socket.id },
  //       room: {
  //         ...JSON.parse(sessionStorage.getItem("room")).room,
  //         room_participants: room_participants,
  //       },
  //     };
  //     sessionStorage.setItem("room", JSON.stringify(data));
  //     setDetails(data);
  //   });
  //   socket.on("LEAVING", (message) => {
  //     console.log(message);
  //   });
  //   socket.on("NEW_HOST", ({ message, user, room }) => {
  //     console.log(message);
  //     const data = {
  //       ...details,
  //       user: {
  //         ...details.user,
  //         socket_id: socket.id,
  //         user_name: user.name,
  //       },
  //       room: {
  //         ...details.room,
  //         room_id: room.room_id,
  //         room_host: room.room_host,
  //         room_participants: room.room_participants,
  //         room_password: room.room_password,
  //       },
  //     };
  //     setDetails(data);
  //     sessionStorage.setItem("room", JSON.stringify(data));
  //   });
  // }, []);
  return (
    <div className="room-wrapper wrapper">
      <RoomHeader />
      {/* <RoomMain peer={peer} status={status} inRoomDetails={details.room} /> */}
      <RoomFooter />
    </div>
  );
};

export default Room;
