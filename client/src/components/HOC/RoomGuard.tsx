/* eslint-disable import/no-anonymous-default-export */
import React, { memo, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { RouteComponentProps, useRouteMatch } from "react-router-dom";
import * as H from "history";
import NotFound from "../NotFound";
import { MessageContext } from "../Providers/MessageProvider";
import { useGetRole, useMe, useRoomSocket, useSocket } from "../../hooks";
import { useCheckRoomMeeting, useGetRooms } from "../api-hooks";
import { menus } from "../RoomComponents/constants";
import { Severities } from "../CustomSnackbar";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

export default (OriginalComponent) => {
  const MixedComponent: React.FC<Props> = (props) => {
    const { role: myRole, isLoading: isLoadingRole } = useGetRole();
    const { room_id, menu, meeting_id } =
      useParams<{ room_id; menu; meeting_id }>();
    const { url, path } = useRouteMatch();
    const history = useHistory();
    const roomSocket = useRoomSocket();
    const [me] = useMe();
    const [isReady, setIsReady] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [messages, setMessages] = useContext(MessageContext);

    const { mutate: checkRoomMeeting } = useCheckRoomMeeting({
      onError: (e) => {
        const { status, data } = e.response;
        if (status === 400) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              message: data.message,
              severity: Severities.WARNING,
            },
          ]);
          const formattedUrl = url.split(`/meeting/${meeting_id}`)[0];
          return history.push(formattedUrl);
        }

        if (status === 404) {
          setError(true);
          setIsReady(true);
        }
      },
    });

    useEffect(() => {
      if (roomSocket) {
        switch (menu) {
          case "meeting":
          case "attendances":
            if (meeting_id) {
              checkRoomMeeting({ room_id, meeting_id });
            }
            setIsReady(true);
            break;

          default:
            setIsReady(true);
            break;
        }
      }
    }, [roomSocket]);

    if (!isReady) {
      return <></>;
    }

    if (!menus.some(({ name }) => name === menu)) return <NotFound />;
    if (
      !isLoadingRole &&
      menus.some(
        ({ name, role }) => role && !role.includes(myRole) && name === menu,
      )
    )
      return <NotFound />;

    return error ? <NotFound /> : <OriginalComponent {...props} />;
  };
  return MixedComponent;
};
