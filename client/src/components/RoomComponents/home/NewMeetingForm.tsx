import { css } from "@emotion/css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import { useMe } from "../../../hooks";
import { useCreateRoomMeeting } from "../../api-hooks";
import { DateTimePicker } from "@material-ui/pickers";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  callAllFunctions,
  formatTimeDurationToReadableFormat,
} from "../../helper";
import { format } from "date-fns";

interface IProps {
  handleCloseModal: (e?: any) => void;
}

const styled = {
  root: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    .form-group {
      margin-bottom: 1rem;
      label {
        font-size: 0.875rem;
      }
    }

    .time-wrapper {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      > div {
        &:not(:last-child) {
          margin-right: 0.625rem;
        }
        flex: 1;
      }

      .form-control {
        display: flex;
        height: auto;
      }
    }
    .checkbox-group {
      margin-bottom: 1rem;
    }

    .info-text {
      font-size: 0.75rem;
      margin-bottom: 1rem;
      p {
        margin-bottom: 0;
        &:not(:last-child) {
          margin-bottom: 0.125rem;
        }
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

const DATE_FORMAT = "dd-MM-yyyy hh:mm a";
const DEFAULT_INTERVAL_MINUTES = 15;

const errorMessage = {
  required: "This field is required",
  smallerThan: "Attendance Finish Time should be greater than Start Time",
  greaterThan: "Attendance Start Time should be smaller than Finish Time",
};

function NewMeetingForm({ handleCloseModal }: IProps) {
  const history = useHistory();
  const { room_id } = useParams<{ room_id }>();
  const { url } = useRouteMatch();
  const [me] = useMe();
  const defaultAttendanceFinishDate = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + DEFAULT_INTERVAL_MINUTES);
    return now;
  }, []);

  const {
    register,
    errors,
    handleSubmit,
    control,
    watch,
    getValues,
    trigger,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      meeting_name: "",
      attendance_start_at: new Date().toString(),
      attendance_finish_at: defaultAttendanceFinishDate.toString(),
    },
  });

  const strAttendanceTime = useMemo(() => {
    const startDate = format(
      new Date(watch("attendance_start_at")),
      "dd-MM-yyyy",
    );
    const finishDate = format(
      new Date(watch("attendance_finish_at")),
      "dd-MM-yyyy",
    );

    return {
      finishDate: format(
        new Date(watch("attendance_finish_at")),
        "eeee, do MMMM yyyy",
      ),
      finishTime: format(new Date(watch("attendance_finish_at")), "hh.mm aa"),
      startDate: format(
        new Date(watch("attendance_start_at")),
        "eeee, do MMMM yyyy",
      ),
      startTime: format(new Date(watch("attendance_start_at")), "hh.mm aa"),
      sameDate: startDate === finishDate,
    };
  }, [watch]);

  const strAttendanceDuration = useMemo(
    () =>
      formatTimeDurationToReadableFormat({
        start: new Date(watch("attendance_start_at")),
        end: new Date(watch("attendance_finish_at")),
        format: ["days", "hours", "minutes", "seconds"],
      }),
    [watch],
  );

  const { mutate } = useCreateRoomMeeting({
    onSuccess: (data) => {
      const now = new Date();
      const meeting_id = data.meeting_id;
      const meeting_start_time = new Date(data.attendance_start_at);
      handleCloseModal();
      if (meeting_start_time <= now)
        history.push(`${url}/meeting/${meeting_id}`);
    },
  });

  async function onSubmit(formData) {
    const attendance_start_at = new Date(formData.attendance_start_at);
    attendance_start_at.setSeconds(0);
    const attendance_finish_at = new Date(formData.attendance_finish_at);
    attendance_finish_at.setSeconds(0);

    mutate({
      user_id: me.user_id,
      room_id,
      meeting_name: formData.meeting_name,
      attendance_start_at: attendance_start_at.toString(),
      attendance_finish_at: attendance_finish_at.toString(),
    });
  }

  return (
    <form className={styled.root} onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>Meeting Name</label>
        <input
          autoFocus
          autoComplete="off"
          ref={register({
            required: true,
          })}
          className="form-control"
          type="text"
          name="meeting_name"
        />
        {errors?.meeting_name && (
          <div className="error">
            <span>{errorMessage[errors.meeting_name.type]}</span>
          </div>
        )}
      </div>

      <div className="time-wrapper">
        <Controller
          control={control}
          name="attendance_start_at"
          render={({ ref, ...field }) => (
            <DateTimePicker
              {...field}
              onChange={callAllFunctions(field.onChange, () => {
                if (errors.attendance_finish_at) {
                  trigger("attendance_finish_at");
                }
              })}
              inputRef={ref}
              format={DATE_FORMAT}
              label="Attendance Start At"
              className="form-control"
              helperText={errorMessage[errors.attendance_start_at?.type]}
              error={!!errors.attendance_start_at}
            />
          )}
          rules={{
            validate: {
              greaterThan: (e) => {
                return (
                  new Date(e) < new Date(getValues("attendance_finish_at"))
                );
              },
            },
          }}
        />
        <Controller
          control={control}
          name="attendance_finish_at"
          render={({ ref, ...field }) => (
            <DateTimePicker
              {...field}
              onChange={callAllFunctions(field.onChange, () => {
                if (errors.attendance_start_at) {
                  trigger("attendance_start_at");
                }
              })}
              inputRef={ref}
              format={DATE_FORMAT}
              label="Attendance Finish At"
              className="form-control"
              helperText={errorMessage[errors.attendance_finish_at?.type]}
              error={!!errors.attendance_finish_at}
            />
          )}
          rules={{
            validate: {
              smallerThan: (e) => {
                return new Date(e) > new Date(getValues("attendance_start_at"));
              },
            },
          }}
        />
      </div>

      {!errors.attendance_finish_at && !errors.attendance_start_at && (
        <div className="info-text">
          <p>
            * The meeting will be started on{" "}
            <b>{strAttendanceTime.startDate}</b> at{" "}
            <b>{strAttendanceTime.startTime}</b>
          </p>
          <p>
            * Meeting attendance is available on{" "}
            {strAttendanceTime.sameDate ? (
              <>
                <b>{strAttendanceTime.startDate}</b> from{" "}
                <b>{strAttendanceTime.startTime}</b> until{" "}
                <b>{strAttendanceTime.finishTime}</b>
              </>
            ) : (
              <>
                <b>{strAttendanceTime.startDate}</b> at{" "}
                <b>{strAttendanceTime.startTime}</b> until{" "}
                <b>{strAttendanceTime.finishDate}</b> at{" "}
                <b>{strAttendanceTime.finishTime}</b>
              </>
            )}
          </p>
          <p>
            * Attendance duration: <b>{strAttendanceDuration}</b>
          </p>
          <p>
            * The meeting <b>will still be joinable</b> even attendance time
            is over.
          </p>
        </div>
      )}

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
