/* eslint-disable import/no-anonymous-default-export */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios-instance";
import { RouteComponentProps, useRouteMatch } from "react-router-dom";
import * as H from "history";
import NotFound from "../NotFound";
import { useMe, useSocket } from "../../hooks";
import { useGetRooms } from "../api-hooks";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

export default (OriginalComponent) => {
  const MixedComponent: React.FC<Props> = (props) => {
    const socket = useSocket();
    const { path } = useRouteMatch();
    const { rooms } = useGetRooms();
    const { room_id } = useParams<{ room_id }>();
    const { history } = props;

    const [me] = useMe();
    const [isReady, setIsReady] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const filterPath = path.split("/")[1];
    useEffect(() => {
      (async function checkRoom() {
        switch (filterPath) {
          case "room":
            if (me) {
              try {
                await axios.post("/users/verify-room", {
                  user_id: me.user_id,
                  room_id,
                });
                socket.on("connect", () => {
                  socket?.emit("JOIN_ROOM", { room_id, me });
                });
                socket?.emit("JOIN_ROOM", { room_id, me });
                setIsReady(true);
              } catch (error) {
                if (error.response === undefined) {
                  return history.replace("/");
                }
                const { data } = error.response;
                if (!data.success) {
                  setError(true);
                }
                setIsReady(true);
              }
            }
            break;
          default:
            setIsReady(true);
            setError(true);
            break;
        }
      })();
    }, [me, filterPath]);

    if (!isReady) {
      return <></>;
    }

    return error ? (
      <NotFound />
    ) : (
      <OriginalComponent status={filterPath} {...props} />
    );
  };
  return MixedComponent;
};

// case "join":
//               // if (isInARoom) {
//               // socket.emit("JOIN_EXIST_ROOM", {
//               //   room_id: room_id,
//               //   name: user_name,
//               //   user_id: user_id,
//               // });
//               // res = await axios.post("/api/checkRoom", { room_id });
//               // if (res.data.success) {
//               //   const resRoomDetail = await axios.get(
//               //     `/api/getRoomDetails?room_id=${room_id}`,
//               //   );
//               //   const resRoomParticipant = await axios.get(
//               //     `/api/getRoomParticipants?room_id=${room_id}`,
//               //   );

//               //   const isHost = await axios.post("/api/isHost", {
//               //     user_id: details.user.user_id,
//               //     room_id,
//               //   });
//               //   const data = {
//               //     ...details,
//               //     user: {
//               //       ...details.user,
//               //       socket_id: socket.id,
//               //     },
//               //     room: {
//               //       ...details.room,
//               //       room_host: resRoomDetail.data.room_host,
//               //       room_id,
//               //       room_password: resRoomDetail.data.room_password,
//               //       room_participants: resRoomParticipant.data,
//               //       room_name: resRoomDetail.data.room_name,
//               //     },
//               //   };
//               //   sessionStorage.setItem("room", JSON.stringify(data));
//               //   setDetails(data);
//               //   if (isHost.data.status) {
//               //     return history.push(`/start/${room_id}`);
//               //   }
//               // }
//               //   break;
//               // } else {
//               //   return history.push("/");
//               // }
//               break;
//             case "start":
//               // if (details.user.user_name !== "") {
//               //   socket.emit("JOIN_NEW_ROOM", {
//               //     room_id: details.room.room_id,
//               //     name: details.user.user_name,
//               //     user_id: details.user.user_id,
//               //     peer_id: details.user.peer_id,
//               //   });
//               //   res = await axios.post("/api/checkRoom", { room_id });
//               //   if (res.data.success) {
//               //     const resRoomDetail = await axios.get(
//               //       `/api/getRoomDetails?room_id=${room_id}`,
//               //     );
//               //     const resRoomParticipant = await axios.get(
//               //       `/api/getRoomParticipants?room_id=${room_id}`,
//               //     );

//               //     const data = {
//               //       ...details,
//               //       user: {
//               //         ...details.user,
//               //         socket_id: socket.id,
//               //       },
//               //       room: {
//               //         ...details.room,
//               //         room_host: resRoomDetail.data.room_host,
//               //         room_id,
//               //         room_password: resRoomDetail.data.room_password,
//               //         room_participants: resRoomParticipant.data,
//               //       },
//               //     };
//               //     sessionStorage.setItem("room", JSON.stringify(data));
//               //     setDetails(data);
//               //     const isHost = await axios.post("/api/isHost", {
//               //       user_id: details.user.user_id,
//               //       room_id,
//               //     });
//               //     if (!isHost.data.status) {
//               //       return history.push(`/join/${room_id}`);
//               //     }
//               //   }
//               //   break;
//               // } else {
//               //   return history.push("/");
//               // }
//               break;
//