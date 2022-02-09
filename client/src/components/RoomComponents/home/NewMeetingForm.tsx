import { css } from "@emotion/css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import { useMe } from "../../../hooks";
import { useCreateRoomMeeting } from "../../api-hooks";

interface IProps {
  handleCloseModal: (e?: any) => void;
}

const styled = {
  root: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    .form-group {
      label {
        font-size: 0.875rem;
      }
    }

    .action-button {
      display: flex;
      flex-direction: row;
      justify-content: end;
      margin-top: auto;
      .btn:not(:last-child) {
        margin-right: 0.625rem;
      }
    }
  `,
};

function NewMeetingForm({ handleCloseModal }: IProps) {
  const history = useHistory();
  const { room_id } = useParams<{ room_id }>();
  const { url } = useRouteMatch();
  const [me] = useMe();
  const { register, errors, handleSubmit } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        meeting_name: yup.string().required("This field is required"),
      }),
    ),
  });

  const { mutate } = useCreateRoomMeeting({
    onSuccess: (data) => {
      const meeting_id = data.meeting_id;
      handleCloseModal();
      history.push(`${url}/meeting/${meeting_id}`);
    },
  });

  async function onSubmit(formData) {
    mutate({
      user_id: me.user_id,
      room_id,
      ...formData,
    });
  }

  return (
    <form className={styled.root} onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>Meeting Name</label>
        <input
          autoComplete="off"
          ref={register}
          className="form-control"
          type="text"
          name="meeting_name"
        />
        <div className="error">
          <span>{errors?.meeting_name?.message}</span>
        </div>
      </div>
      <div className="action-button">
        <button
          type="button"
          onClick={handleCloseModal}
          className="btn btn-outline-danger"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          Submit
        </button>
      </div>
    </form>
  );
}

export default NewMeetingForm;
