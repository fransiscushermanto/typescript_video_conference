import { css } from "@emotion/css";
import { CircularProgress } from "@material-ui/core";
import { useRef } from "react";
import { useGetRoom } from "../../api-hooks";

const styled = {
  root: css`
    display: flex;
    flex-direction: column;
    .copy {
      cursor: pointer;
    }
    .loading-wrapper {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
};

function Setting() {
  const { data, isFetching } = useGetRoom({ enabled: true });
  const passwordRef = useRef<any>(null);
  const roomIdRef = useRef<any>(null);

  async function handleCopyPassword() {
    const target = passwordRef.current;
    await navigator.clipboard.writeText(target.innerHTML);
    alert("Password Copied!");
  }
  async function handleCopyRoomId() {
    const target = roomIdRef.current;
    await navigator.clipboard.writeText(target.innerHTML);
    alert("Room Id Copied!");
  }

  return (
    <div className={styled.root}>
      {isFetching ? (
        <div className="loading-wrapper">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="">Room Name</label>
            <span className="form-control">{data?.room_name}</span>
          </div>
          <div className="form-group">
            <label htmlFor="">Room Id</label>
            <span
              ref={roomIdRef}
              className="form-control copy"
              title={"Click to copy"}
              onClick={handleCopyRoomId}
            >
              {data?.room_id}
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="">Room Password</label>
            <span
              ref={passwordRef}
              className="form-control copy"
              title={"Click to copy"}
              onClick={handleCopyPassword}
            >
              {data?.room_password}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default Setting;
