import { css } from "@emotion/css";
import { useHistory, useParams } from "react-router";
import Participant from "./participants/Participant";
import WaitingRoom from "./waitingRoom/WaitingRoom";
import Home from "./home/Home";
import MeetingRoom from "./meeting/MeetingRoom";

const styled = {
  root: css`
    position: relative;

    flex: 1;
    width: 100%;
    color: white;

    > div {
      padding: 2.5rem;
    }
  `,
};

function Content() {
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
      case "meeting":
        return <MeetingRoom />;
      default:
        return <div></div>;
    }
  }

  return <div className={styled.root}>{renderContent()}</div>;
}

export default Content;
