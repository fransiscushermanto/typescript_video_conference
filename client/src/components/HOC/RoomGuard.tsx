/* eslint-disable import/no-anonymous-default-export */
import React, { memo, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios-instance";
import { RouteComponentProps, useRouteMatch } from "react-router-dom";
import * as H from "history";
import NotFound from "../NotFound";
import { MessageContext } from "../Providers/MessageProvider";
import { useGetRole, useMe, useRoomSocket, useSocket } from "../../hooks";
import { useCheckRoomMeeting, useGetRooms } from "../api-hooks";
import { menus } from "../RoomComponents/constants";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

export default (OriginalComponent) => {
  const MixedComponent: React.FC<Props> = (props) => {
    const myRole = useGetRole();
    const { room_id, menu, meeting_id } =
      useParams<{ room_id; menu; meeting_id }>();
    const roomSocket = useRoomSocket();
    const [me] = useMe();
    const [isReady, setIsReady] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const { mutate: checkRoomMeeting } = useCheckRoomMeeting({
      onError: () => {
        setError(true);
        setIsReady(true);
      },
    });

    useEffect(() => {
      switch (menu) {
        case "meeting":
          checkRoomMeeting({ room_id, meeting_id });
          setIsReady(true);
          break;

        default:
          setIsReady(true);
          break;
      }
    }, [roomSocket]);

    if (!isReady) {
      return <></>;
    }

    if (!menus.some(({ name }) => name === menu)) return <NotFound />;
    if (
      menus.some(
        ({ name, role }) => role && !role.includes(myRole) && name === menu,
      )
    )
      return <NotFound />;

    return error ? <NotFound /> : <OriginalComponent {...props} />;
  };
  return MixedComponent;
};
