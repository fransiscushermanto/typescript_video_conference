/* eslint-disable import/no-anonymous-default-export */
import React, { useEffect } from "react";
import * as H from "history";
import { RouteComponentProps, useRouteMatch } from "react-router-dom";
import { useAuth, useMe, useSocket } from "../../hooks";
interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

export default (OriginalComponent) => {
  const MixedComponent: React.FC<Props> = (props) => {
    const { path } = useRouteMatch();
    const { history } = props;
    const [me] = useMe();
    const { isLoggedIn } = useAuth();
    const socket = useSocket();

    useEffect(() => {
      if (me) {
        socket.emit("LIST_USER_SOCKET", { me });
      }
    }, [me]);

    if (path.includes("/login")) {
      if (isLoggedIn) {
        history.push("/");
        return null;
      }
    } else {
      if (!isLoggedIn) {
        history.push("/login");
        return null;
      }
    }

    return <OriginalComponent {...props} />;
  };

  return MixedComponent;
};
