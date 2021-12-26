import { useMe } from "../../../hooks";
import { useGetRoomParticipants } from "../../api-hooks";

function Participant() {
  const [me] = useMe();
  const { participants } = useGetRoomParticipants();

  return (
    <div style={{ color: "white" }}>
      {participants &&
        participants.map(({ role, user_id, user_name }) => (
          <div key={user_id}>
            <div>{role}</div>
            <div>{user_id}</div>
            <div>{me.user_id === user_id ? "You" : user_name}</div>
          </div>
        ))}
    </div>
  );
}

export default Participant;
