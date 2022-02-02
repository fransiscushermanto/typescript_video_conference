import { css } from "@emotion/css";
import { useEffect } from "react";
import {
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router";
import { useGetRole, useMe, useSocket } from "../../hooks";
import { useGetRoomParticipants } from "../api-hooks";
import RoomGuard from "../HOC/RoomGuard";
import NotFound from "../NotFound";
import { RTCProvider } from "../Providers/RTCProvider";
import Content from "./Content";
import SidebarRoom from "./SidebarRoom";

const styled = {
  root: css`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    height: 100%;
  `,
};

function Room() {
  const [me] = useMe();
  const { path, url } = useRouteMatch();
  const { pathname } = useLocation();
  const activeMenu = pathname.split(url)[1].split("/")[1];

  useGetRoomParticipants({
    refetchOnWindowFocus: false,
    enabled: !!(me && me.user_id),
  });

  return (
    <RTCProvider>
      <div className={styled.root}>
        <SidebarRoom activeMenu={activeMenu} />
        <Route exact path={`${path}/`} component={Content} />
        <Switch>
          <Route
            path={`${path}/:menu/:meeting_id`}
            component={RoomGuard(Content)}
          />
          <Route path={`${path}/:menu`} component={RoomGuard(Content)} />
        </Switch>
      </div>
    </RTCProvider>
  );
}

export default Room;
