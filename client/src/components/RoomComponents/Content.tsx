import { css } from "@emotion/css";
import { useParams } from "react-router";
import Participant from "./participants/Participant";
import Attendances from "./attendances/Attendance";
import WaitingRoom from "./waitingRoom/WaitingRoom";
import Home from "./home/Home";
import MeetingRoom from "./meeting/MeetingRoom";
import Setting from "./settings/Setting";
import { memo } from "react";

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
      case "attendances":
        return <Attendances />;
      case "settings":
        return <Setting />;
      default:
        return <div></div>;
    }
  }

  return <div className={styled.root}>{renderContent()}</div>;
}

export default memo(Content);
