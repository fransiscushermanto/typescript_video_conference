import React, { memo, useContext, useEffect } from "react";
import RoomFooter from "./MeetingRoomFooter";
import RoomHeader from "./MeetingRoomHeader";
import RoomMain from "./MeetingRoomMain";
import { Severities } from "../../CustomSnackbar";
import { MessageContext } from "../../Providers/MessageProvider";
import { useRoomSocket, useSocket } from "../../../hooks";
import { useParams } from "react-router-dom";
import { css, cx } from "@emotion/css";
import { RCTOfferStatus } from "../../api-hooks/type";

interface Props {}

const styled = {
  root: css`
    padding: 0;
    height: 100vh;
  `,
};

const MeetingRoom: React.FC<Props> = () => {
  const [messages, setMessages] = useContext(MessageContext);
  const roomSocket = useRoomSocket();
  const { meeting_id } = useParams<{ meeting_id }>();

  useEffect(() => {
    // socket.on("RTC_OFFER", ({ status }: { status: RCTOfferStatus }) => {
    //   console.log("rtc offer status", status);
    // });

    roomSocket?.on("NEW_PARTICIPANT", ({ message }) => {
      console.log(message);
    });
  }, [roomSocket]);

  return (
    <div className={cx(styled.root, "meeting-room-wrapper wrapper")}>
      <RoomHeader />
      <RoomMain />
      <RoomFooter />
    </div>
  );
};

export default memo(MeetingRoom);
