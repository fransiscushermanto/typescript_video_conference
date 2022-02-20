import { css } from "@emotion/css";
import React from "react";
import { getInitialFromString, hashCode, intToRGB } from "../../helper";
import { Participant } from "../../Providers/MeetingRoomProvider";

interface IProps extends Participant {}

const styled = {
  root: css`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;

    background-color: white;
    padding: 0.625rem;
    border-radius: 0.625rem;

    color: black;

    &:not(:last-child) {
      margin-bottom: 1.25rem;
    }

    .inner-card {
      width: 100%;

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
    }
  `,
  profile: (bg: string) => css`
    margin-right: 0.625rem;

    height: 2.75rem;
    width: 2.75rem;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: ${bg};

    clip-path: circle();
  `,
};

function ParticipantCard({ user_name, user_id, role }: IProps) {
  const initials = React.useMemo(
    () => getInitialFromString(user_name),
    [user_name],
  );

  return (
    <div className={styled.root}>
      <div className={styled.profile(intToRGB(hashCode(user_id)))}>
        {initials}
      </div>
      <div className="inner-card">
        <div className="user-name">
          <span>{user_name}</span>
        </div>
      </div>
    </div>
  );
}

export default ParticipantCard;
