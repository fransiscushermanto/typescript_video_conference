import React, { useContext } from "react";
import { css } from "@emotion/css";
import { useGetMeetingRoomInfo, useGetRoomParticipants } from "../../api-hooks";
import { ParticipantType } from "../../api-hooks/type";
import { useParams } from "react-router-dom";
import { useMe } from "../../../hooks";
import { format } from "date-fns";

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
  const [me] = useMe();
  const { meeting_id, room_id } = useParams<{ meeting_id; room_id }>();
  const { data } = useGetMeetingRoomInfo({ meeting_id, room_id });
  const { participants } = useGetRoomParticipants();
  const hostInfo = participants.find(
    (pariticipant) => pariticipant.role === ParticipantType.HOST,
  );

  return (
    <div onClick={onClick} className={styled.root}>
      <h4 className={styled.title}>{data?.meeting_name}</h4>
      <div className={styled.roomDetailWrapper}>
        <RoomDetailItem label="Meeting ID" value={meeting_id} />
        <RoomDetailItem
          label="Host"
          value={`${hostInfo?.user_name} ${
            String(hostInfo?.user_id).includes(me.user_id) ? "(You)" : ""
          }`}
        />
        <RoomDetailItem
          label="Created by"
          value={`${data?.created_by.displayName} ${
            String(data?.created_by.uid).includes(me.user_id) ? "(You)" : ""
          }`}
        />
        <RoomDetailItem
          label="Created at"
          value={format(new Date(data?.created_at), "eeee, MMMM yyyy HH.mm")}
        />
      </div>
    </div>
  );
}

export default MeetingRoomInfo;
