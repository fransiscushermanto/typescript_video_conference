import { css } from "@emotion/css";
import { useHistory, useParams } from "react-router";
import Participant from "./participants/Participant";
import WaitingRoom from "./waitingRoom/WaitingRoom";
import Home from "./home/Home";

const styled = {
  root: css`
    position: relative;

    flex: 1;
    width: 100%;
    padding: 2.5rem;
    color: white;
  `,
};

function Content() {
  const history = useHistory();

  const { menu } = useParams<{ menu }>();

  function renderContent() {
    if (!menu) {
      return <Home />;
    }

    switch (menu) {
      case "participants":
        return <Participant />;
      case "waiting-room":
        return <WaitingRoom />;
      default:
        return <div></div>;
    }
  }

  return <div className={styled.root}>{renderContent()}</div>;
}

export default Content;
