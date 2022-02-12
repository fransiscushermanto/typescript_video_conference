import React, { memo, useContext, useEffect } from "react";
import RoomFooter from "./MeetingRoomFooter";
import RoomHeader from "./MeetingRoomHeader";
import RoomMain from "./MeetingRoomMain";
import { Severities } from "../../CustomSnackbar";
import { MessageContext } from "../../Providers/MessageProvider";
import { useMediaQuery, useRoomSocket } from "../../../hooks";
import { useParams } from "react-router-dom";
import { css, cx } from "@emotion/css";
import { setMobileCSSHeightProperty } from "../../helper";

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
  const isNotDesktop = useMediaQuery(`(max-width: 768px)`);

  useEffect(() => {
    if (isNotDesktop) {
      setMobileCSSHeightProperty();
    }

    window.addEventListener("resize", () => {
      if (isNotDesktop) {
        setMobileCSSHeightProperty();
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, [isNotDesktop]);

  useEffect(() => {
    roomSocket?.on("NEW_PARTICIPANT", ({ message }) => {
      setMessages([
        ...messages,
        {
          id: Date.now(),
          message: message,
          severity: Severities.SUCCESS,
        },
      ]);
    });
  }, [roomSocket, setMessages]);

  return (
    <div className={cx(styled.root, "meeting-room-wrapper wrapper")}>
      <RoomHeader />
      <RoomMain />
      <RoomFooter />
    </div>
  );
};

export default memo(MeetingRoom);
