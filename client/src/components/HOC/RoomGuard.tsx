/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios-instance";
import { RouteComponentProps, useRouteMatch } from "react-router-dom";
import * as H from "history";
import { SocketContext } from "../Providers/SocketProvider";
import NotFound from "../NotFound";
import { MessageContext } from "../Providers/MessageProvider";
import { Severities } from "../CustomSnackbar";
import { useRoom } from "../../hooks";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

export default (OriginalComponent) => {
  const MixedComponent: React.FC<Props> = (props) => {
    const { path } = useRouteMatch();
    const { roomState, meState } = useRoom();
    const { socket } = useContext(SocketContext);
    const { room_id } = useParams<{ room_id }>();
    const { history } = props;

    const [room, setRoom] = roomState;
    const [me, setMe] = meState;
    const [error, setError] = useState<boolean>(false);
    const [messages, setMessages] = useContext(MessageContext);

    const filterPath = path.split("/")[1];
    React.useEffect(() => {
      (async function checkRoom() {
        try {
          let res;
          const isInARoom = room.room_participants.some(
            (participant) => participant.user_id === me.user_id,
          );
          switch (filterPath) {
            case "join":
              if (isInARoom) {
                // socket.emit("JOIN_EXIST_ROOM", {
                //   room_id: room_id,
                //   name: user_name,
                //   user_id: user_id,
                // });
                // res = await axios.post("/api/checkRoom", { room_id });
                // if (res.data.success) {
                //   const resRoomDetail = await axios.get(
                //     `/api/getRoomDetails?room_id=${room_id}`,
                //   );
                //   const resRoomParticipant = await axios.get(
                //     `/api/getRoomParticipants?room_id=${room_id}`,
                //   );

                //   const isHost = await axios.post("/api/isHost", {
                //     user_id: details.user.user_id,
                //     room_id,
                //   });
                //   const data = {
                //     ...details,
                //     user: {
                //       ...details.user,
                //       socket_id: socket.id,
                //     },
                //     room: {
                //       ...details.room,
                //       room_host: resRoomDetail.data.room_host,
                //       room_id,
                //       room_password: resRoomDetail.data.room_password,
                //       room_participants: resRoomParticipant.data,
                //       room_name: resRoomDetail.data.room_name,
                //     },
                //   };
                //   sessionStorage.setItem("room", JSON.stringify(data));
                //   setDetails(data);
                //   if (isHost.data.status) {
                //     return history.push(`/start/${room_id}`);
                //   }
                // }
                break;
              } else {
                return history.push("/");
              }
            case "start":
            // if (details.user.user_name !== "") {
            //   socket.emit("JOIN_NEW_ROOM", {
            //     room_id: details.room.room_id,
            //     name: details.user.user_name,
            //     user_id: details.user.user_id,
            //     peer_id: details.user.peer_id,
            //   });
            //   res = await axios.post("/api/checkRoom", { room_id });
            //   if (res.data.success) {
            //     const resRoomDetail = await axios.get(
            //       `/api/getRoomDetails?room_id=${room_id}`,
            //     );
            //     const resRoomParticipant = await axios.get(
            //       `/api/getRoomParticipants?room_id=${room_id}`,
            //     );

            //     const data = {
            //       ...details,
            //       user: {
            //         ...details.user,
            //         socket_id: socket.id,
            //       },
            //       room: {
            //         ...details.room,
            //         room_host: resRoomDetail.data.room_host,
            //         room_id,
            //         room_password: resRoomDetail.data.room_password,
            //         room_participants: resRoomParticipant.data,
            //       },
            //     };
            //     sessionStorage.setItem("room", JSON.stringify(data));
            //     setDetails(data);
            //     const isHost = await axios.post("/api/isHost", {
            //       user_id: details.user.user_id,
            //       room_id,
            //     });
            //     if (!isHost.data.status) {
            //       return history.push(`/join/${room_id}`);
            //     }
            //   }
            //   break;
            // } else {
            //   return history.push("/");
            // }
            default:
              setError(true);
          }
        } catch (error) {
          if (error.response === undefined) {
            return history.push("/");
          }

          const { data } = error.response;

          if (!data.success) {
            setMessages([
              ...messages,
              {
                id: Date.now(),
                message: data.message,
                severity: Severities.ERROR,
              },
            ]);
            setError(true);
          }
        }
      })();
    }, [room_id, history]);

    return error ? (
      <NotFound />
    ) : (
      <OriginalComponent status={filterPath} {...props} />
    );
  };
  return MixedComponent;
};
