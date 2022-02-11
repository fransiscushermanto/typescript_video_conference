import { css } from "@emotion/css";
import React from "react";
import { Severities } from "../../CustomSnackbar";
import { MessageContext } from "../../Providers/MessageProvider";
import { Info } from "../../Shapes";

const styled = {
  root: css`
    height: 2.5rem;
  `,
};

const MeetingRoomHeader: React.FC = () => {
  const [messages, setMessages] = React.useContext(MessageContext);
  return <header className={styled.root}></header>;
};

export default MeetingRoomHeader;
