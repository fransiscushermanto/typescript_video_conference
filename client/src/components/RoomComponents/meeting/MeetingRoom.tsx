import React, { useContext } from "react";
import RoomFooter from "./MeetingRoomFooter";
import RoomHeader from "./MeetingRoomHeader";
import RoomMain from "./MeetingRoomMain";
import { Severities } from "../../CustomSnackbar";
import { MessageContext } from "../../Providers/MessageProvider";
import { useSocket } from "../../../hooks";
import { useParams } from "react-router-dom";
import { css, cx } from "@emotion/css";

interface Props {}

const styled = {
  root: css`
    padding: 0;
    height: 100vh;
  `,
};

const MeetingRoom: React.FC<Props> = () => {
  const [messages, setMessages] = useContext(MessageContext);
  const socket = useSocket();
  const { meeting_id } = useParams<{ meeting_id }>();

  console.log(meeting_id);

  return (
    <div className={cx(styled.root, "meeting-room-wrapper wrapper")}>
      <RoomHeader />
      <RoomMain />
      <RoomFooter />
    </div>
  );
};

export default MeetingRoom;
