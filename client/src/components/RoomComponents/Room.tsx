import { css } from "@emotion/css";
import { memo, useMemo } from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";
import { useMe } from "../../hooks";
import { useGetRoomParticipants } from "../api-hooks";
import RoomGuard from "../HOC/RoomGuard";
import { RoomSocketProvider } from "../Providers/RoomSocketProvider";
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
  const activeMenu = useMemo(
    () => pathname.split(url)[1].split("/")[1],
    [pathname, url],
  );

  useGetRoomParticipants({
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!(me && me.user_id),
  });

  return useMemo(
    () => (
      <RoomSocketProvider>
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
      </RoomSocketProvider>
    ),
    [activeMenu, path],
  );
}

export default memo(Room);
