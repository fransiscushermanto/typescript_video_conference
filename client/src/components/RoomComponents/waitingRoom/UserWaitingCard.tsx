import { css } from "@emotion/css";
import React, { useEffect } from "react";
import { useGetRole, useMe } from "../../../hooks";
import { useGetRoomParticipants } from "../../api-hooks";
import { ParticipantType } from "../../api-hooks/type";

interface IUserWaitingCardProps {
  name: string;
  onAccept: (...args) => void;
  onReject: (...args) => void;
}

const styled = {
  root: css`
    display: flex;
    flex-direction: column;

    padding: 1.25rem;

    background: white;

    color: black;
    width: fit-content;
    border-radius: 1.25rem;

    > div:not(:last-child) {
      margin-bottom: 0.625rem;
    }

    .name {
      font-size: 1.25rem;
      font-weight: bold;
    }

    .button-wrapper {
      display: flex;
      .btn:not(:last-child) {
        margin-right: 0.625rem;
      }
      .btn:disabled {
        cursor: not-allowed;
      }
    }
  `,
};

function UserWaitingCard({ name, onAccept, onReject }: IUserWaitingCardProps) {
  const { role: myRole } = useGetRole();

  return (
    <div className={styled.root}>
      <div className="name">
        <span>{name}</span>
      </div>
      <div className="button-wrapper">
        <button
          className="btn btn-success"
          disabled={myRole === ParticipantType.PARTICIPANT}
          onClick={onAccept}
        >
          Accept
        </button>
        <button
          className="btn btn-danger"
          disabled={myRole === ParticipantType.PARTICIPANT}
          onClick={onReject}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default UserWaitingCard;
