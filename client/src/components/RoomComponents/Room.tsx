import { css } from "@emotion/css";
import { Route, useRouteMatch } from "react-router";
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
  const { path } = useRouteMatch();

  return (
    <div className={styled.root}>
      <SidebarRoom />
      <Route exact path={`${path}/`} component={Content} />
      <Route path={`${path}/:menu`} component={Content} />
    </div>
  );
}

export default Room;
