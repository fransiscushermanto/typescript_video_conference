import { css } from "@emotion/css";
import { Route, useLocation, useParams, useRouteMatch } from "react-router";
import { useMe } from "../../hooks";
import { useGetRoomParticipants } from "../api-hooks";
import NotFound from "../NotFound";
import { RTCProvider } from "../Providers/RTCProvider";
import { menus } from "./constants";
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

  if (!menus.some(({ name }) => name === activeMenu)) return <NotFound />;

  return (
    <RTCProvider>
      <div className={styled.root}>
        <SidebarRoom activeMenu={activeMenu} />
        <Route exact path={`${path}/`} component={Content} />
        <Route path={`${path}/:menu`} component={Content} />
      </div>
    </RTCProvider>
  );
}

export default Room;
