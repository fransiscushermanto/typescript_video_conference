import React, { useContext } from "react";
import { MessageContext } from "../Providers/MessageProvider";
import { Severities } from "../CustomSnackbar";
import { useCheckRoom, useJoinRoom } from "../api-hooks";
import { useMe, useSocket } from "../../hooks";
import { useFormContext } from "react-hook-form";

interface Props {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: any;
  onSubmit: (any) => void;
  register: any;
  errors: any;
}

const JoinPage: React.FC<Props> = ({
  setCurrentPage,
  handleSubmit,
  register,
  onSubmit,
  errors,
}) => {
  const socket = useSocket();
  const [me] = useMe();
  const [messages, setMessages] = useContext(MessageContext);
  const { getValues } = useFormContext();

  const { mutateAsync: mutateAsyncCheckRoom } = useCheckRoom({
    onSuccess: async () => {
      var password = prompt("Please enter room password");
      if (password !== null) {
        await mutateAsyncJoinRoom({
          room_id: getValues().room_id,
          room_password: password,
          user_id: me.user_id,
        });
      }
    },
    onError: ({ response: { data } }) => {
      setMessages([
        ...messages,
        {
          id: Date.now(),
          message: data?.message,
          severity: Severities.ERROR,
        },
      ]);
    },
  });

  const { mutateAsync: mutateAsyncJoinRoom } = useJoinRoom({
    onSuccess: () => {
      socket.emit("JOIN_ROOM", { room_id: getValues().room_id, me });
      onSubmit(getValues());
    },
    onError: ({ response: { data } }) => {
      setMessages([
        ...messages,
        {
          id: Date.now(),
          message: data.message,
          severity: Severities.ERROR,
        },
      ]);
    },
  });

  const checkRoom = async (formData: { room_id: string; name: string }) => {
    await mutateAsyncCheckRoom({ room_id: formData.room_id });
  };

  return (
    <div className="form-wrapper join">
      <form className="form" onSubmit={handleSubmit(checkRoom)}>
        <div className="form-group">
          <label>Room ID</label>
          <input
            autoComplete="off"
            className="form-control"
            type="text"
            name="room_id"
            ref={register}
          />
          <div className="error">
            <span>{errors?.room_id?.message}</span>
          </div>
        </div>
        <button className="btn btn-success mb-1" type="submit">
          Join
        </button>
        <button
          className="btn btn-danger"
          type="button"
          onClick={() => setCurrentPage("default")}
        >
          Back
        </button>
      </form>
    </div>
  );
};

export default JoinPage;
