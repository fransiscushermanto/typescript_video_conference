import React, { useContext } from "react";
import { MessageContext } from "../Providers/MessageProvider";
import { Severities } from "../CustomSnackbar";
import axios from "../../axios-instance";

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
  const [messages, setMessages] = useContext(MessageContext);

  const checkRoom = async (formData: { room_id: string; name: string }) => {
    try {
      const res = await axios.post("/api/checkRoom", {
        room_id: formData.room_id,
      });
      if (res.data.success) {
        var password = prompt("Please enter room password");
        if (password !== null) {
          formData["room_password"] = password;
          const res = await axios.post("/api/joinRoom", {
            room_id: formData.room_id,
            room_password: password,
            name: formData.name,
          });
          formData["user_id"] = res.data.user_id;
          if (res.data.success) {
            onSubmit(formData);
          }
        }
      }
    } catch (error) {
      setMessages([
        ...messages,
        {
          id: Date.now(),
          message: error.response.data.message,
          severity: Severities.ERROR,
        },
      ]);
    }
  };

  return (
    <div className="form-wrapper join">
      <form className="form" onSubmit={handleSubmit(checkRoom)}>
        <div className="form-group">
          <label>Name</label>
          <input
            autoComplete="off"
            ref={register}
            className="form-control"
            type="text"
            name="name"
          />
          <span className="error">{errors?.name?.message}</span>
        </div>
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
