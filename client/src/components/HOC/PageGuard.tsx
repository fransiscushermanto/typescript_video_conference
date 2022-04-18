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
