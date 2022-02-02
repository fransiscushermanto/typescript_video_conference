import React from "react";
import { Severities } from "../../CustomSnackbar";
import { MessageContext } from "../../Providers/MessageProvider";
import { Info } from "../../Shapes";

const MeetingRoomHeader: React.FC = () => {
  const [messages, setMessages] = React.useContext(MessageContext);
  return <header></header>;
};

export default MeetingRoomHeader;
