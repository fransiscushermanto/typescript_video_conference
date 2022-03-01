import React, { memo, useContext, useEffect, useState } from "react";
import RoomFooter from "./MeetingRoomFooter";
import RoomHeader from "./MeetingRoomHeader";
import RoomMain from "./MeetingRoomMain";
import MeetingSetup from "./MeetingSetup";
import { Severities } from "../../CustomSnackbar";
import { MessageContext } from "../../Providers/MessageProvider";
import { useMediaQuery, useRoomSocket } from "../../../hooks";
import { useParams } from "react-router-dom";
import { css, cx } from "@emotion/css";
import { setMobileCSSHeightProperty } from "../../helper";
import { useGetMeetingRoomInfo } from "../../api-hooks";
import { MeetingRoomProvider } from "../../Providers/MeetingRoomProvider";

interface Props {}

const styled = {
  root: css`
    padding: 0;
    height: 100vh;
  `,
};

const MeetingRoom: React.FC<Props> = () => {
  const roomSocket = useRoomSocket();
  const isNotDesktop = useMediaQuery(`(max-width: 768px)`);
  const [messages, setMessages] = useContext(MessageContext);
  const { meeting_id, room_id } = useParams<{ meeting_id; room_id }>();

  const [isReadyToJoin, setIsReadyToJoin] = useState<boolean>(false);

  useGetMeetingRoomInfo({ meeting_id, room_id }, { enabled: true });

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
    <MeetingRoomProvider isReadyToJoin={isReadyToJoin}>
      {isReadyToJoin ? (
        <div className={cx(styled.root, "meeting-room-wrapper wrapper")}>
          <RoomHeader />
          <RoomMain />
          <RoomFooter />
        </div>
      ) : (
        <MeetingSetup onJoin={() => setIsReadyToJoin(true)} />
      )}
    </MeetingRoomProvider>
  );
};

export default memo(MeetingRoom);
