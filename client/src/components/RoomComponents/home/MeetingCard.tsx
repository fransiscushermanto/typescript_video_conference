import { css } from "@emotion/css";
import React from "react";

interface IProps {
  meeting_id: string;
  meeting_name: string;
}

const styled = {
  root: css`
    width: 100%;
    height: auto;
    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.5);

    color: black;

    &:not(:last-child) {
      margin-bottom: 1.25rem;
    }

    .inner-card {
      width: 100%;
      background-color: white;
      padding: 0.625rem;

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;

      border-radius: 0.625rem;

      .meeting-info {
        display: flex;
        flex-direction: column;

        .meeting_id {
          font-size: 0.625rem;
          color: rgba(0, 0, 0, 0.5);
        }

        .meeting_name {
          font-weight: bold;
        }
      }

      .join-btn {
        margin-left: auto;
      }
    }
  `,
};

function MeetingCard({ meeting_id, meeting_name }: IProps) {
  return (
    <div className={styled.root}>
      <div className="inner-card">
        <div className="meeting-info">
          <div className="meeting_id">
            <span>{meeting_id}</span>
          </div>
          <div className="meeting_name">
            <span>{meeting_name}</span>
          </div>
        </div>
        <div className="join-btn btn btn-success">Join</div>
      </div>
    </div>
  );
}

export default MeetingCard;
