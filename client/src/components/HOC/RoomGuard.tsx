/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios-instance";
import { RouteComponentProps, useRouteMatch } from "react-router-dom";
import * as H from "history";
import NotFound from "../NotFound";
import { MessageContext } from "../Providers/MessageProvider";
import { useGetRole, useMe, useSocket } from "../../hooks";
import { useGetRooms } from "../api-hooks";
import { menus } from "../RoomComponents/constants";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

export default (OriginalComponent) => {
  const MixedComponent: React.FC<Props> = (props) => {
    const socket = useSocket();
    const myRole = useGetRole();
    const { path } = useRouteMatch();
    const { rooms } = useGetRooms();
    const { menu, meeting_id } = useParams<{ menu; meeting_id }>();
    const { history } = props;

    const [me] = useMe();
    const [isReady, setIsReady] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    useEffect(() => {
      (async function checkRoom() {
        console.log(menu);
        switch (menu) {
          case "meeting":
            if (me) {
              try {
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
            break;
        }
      })();
    }, [meeting_id, me, history, rooms]);

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
