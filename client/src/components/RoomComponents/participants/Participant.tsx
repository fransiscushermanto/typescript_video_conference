import { css } from "@emotion/css";
import React, { useMemo } from "react";
import { useMe } from "../../../hooks";
import { useGetRoomParticipants } from "../../api-hooks";
import { groupParitcipantsByRole } from "./helper";
import ParticipantCard from "./ParticipantCard";

const styled = {
  root: css`
    color: white;
    height: 100%;
    overflow-y: auto;

    .role-title {
      margin-bottom: 0.625rem;
      font-weight: bold;
    }
  `,
};

function Participant() {
  const [me] = useMe();
  const { participants } = useGetRoomParticipants();

  const groupedParticipants = useMemo(
    () => groupParitcipantsByRole(participants),
    [participants],
  );

  return (
    <div className={styled.root}>
      {groupedParticipants &&
        groupedParticipants.map(({ role, participants }) => {
          return (
            <React.Fragment key={role}>
              <div className="role-title">
                <span>
                  {role.substring(0, 1).toUpperCase()}
                  {role.substring(1, role.length)} ({participants.length})
                </span>
              </div>
              {participants.map((participant) => (
                <ParticipantCard key={participant.user_id} {...participant} />
              ))}
            </React.Fragment>
          );
        })}
    </div>
  );
}

export default Participant;
