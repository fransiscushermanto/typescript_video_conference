import React, { useContext } from "react";
import { MessageContext } from "../Providers/MessageProvider";
import { Severities } from "../CustomSnackbar";
import axios from "../../axios-instance";
import { useCheckRoom } from "../api-hooks";
import { useMe } from "../../hooks";

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
  const [me] = useMe();
  const [messages, setMessages] = useContext(MessageContext);

  const { mutateAsync } = useCheckRoom({
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
    const res = await mutateAsync({ room_id: formData.room_id });
    if (res.success) {
      var password = prompt("Please enter room password");
      if (password !== null) {
        const res = await axios.post("/api/joinRoom", {
          room_id: formData.room_id,
          room_password: password,
          user_id: me.user_id,
        });
        // if (res.data.success) {
        //   onSubmit(formData);
        // }
      }
    }
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
          <span className="error">{errors?.room_id?.message}</span>
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
