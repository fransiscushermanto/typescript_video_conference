import { css } from "@emotion/css";
import { useHistory, useParams } from "react-router";
import Participant from "./participants/Participant";
import WaitingRoom from "./waitingRoom/WaitingRoom";

const styled = {
  root: css`
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
      return <div style={{ color: "white" }}>Home</div>;
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
