import React, { useContext } from "react";
import { css } from "@emotion/css";

interface Props {
  onClick: () => void;
}

const styled = {
  root: css`
    z-index: 12;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    width: 31.25rem;
    height: auto;
    top: 100%;
    left: 0;
    margin-top: 0.3125rem;
    border: 1px solid hsla(0, 0%, 100%, 0.12);
    box-shadow: 0 8px 24px rgb(0 0 0 / 30%);
    backdrop-filter: blur(20px);
    border-radius: 0.5rem;
    padding: 1.5rem;
    color: white;
  `,
  title: css`
    margin-bottom: 1.5rem;
  `,
  roomDetailWrapper: css`
    display: flex;
    flex-direction: column;
  `,
  roomDetailItem: css`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    > div:first-of-type {
      width: 150px;
    }
    font-size: 0.875rem;
  `,
};

function RoomDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styled.roomDetailItem}>
      <div className="label">
        <span>{label}</span>
      </div>
      <div className="value">
        <span>{value}</span>
      </div>
    </div>
  );
}

function MeetingRoomInfo({ onClick }: Props) {
  // const hostInfo = room.room_participants.hosts?.find(
  //   (host) => host.status === "host",
  // );

  return (
    <div onClick={onClick} className={styled.root}>
      {/* <h4 className={styled.title}>{room.room_name}</h4>
      <div className={styled.roomDetailWrapper}>
        <RoomDetailItem label="Room ID" value={room?.room_id} />
        <RoomDetailItem
          label="Host"
          value={`${hostInfo?.user_name} ${
            String(hostInfo?.user_id).includes(user.user_id) ? "(You)" : ""
          }`}
        />
        <RoomDetailItem label="Passcode" value={room?.room_password} />
        <RoomDetailItem label="Participant ID" value={user.user_id} />
      </div> */}
    </div>
  );
}

export default MeetingRoomInfo;
