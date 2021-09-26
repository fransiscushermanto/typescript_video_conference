import { css } from "@emotion/css";
import { useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { useMe, useRoom } from "../../hooks";
import Participant from "./participants/Participant";

const styled = {
  root: css`
    flex: 1;
    width: 100%;
    padding: 2.5rem;
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
      default:
        return <div></div>;
    }
  }

  return <div className={styled.root}>{renderContent()}</div>;
}

export default Content;
