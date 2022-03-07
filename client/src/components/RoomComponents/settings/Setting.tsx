import { css } from "@emotion/css";
import { useRef } from "react";
import { useGetRoom } from "../../api-hooks";

const styled = {
  root: css`
    display: flex;
    flex-direction: column;
    .copy {
      cursor: pointer;
    }
  `,
};

function Setting() {
  const { data } = useGetRoom({ enabled: true });
  const copyRef = useRef<any>(null);

  async function handleCopy() {
    const target = copyRef.current;
    await navigator.clipboard.writeText(target.innerHTML);
    alert("Password Copied!");
  }

  return (
    <div className={styled.root}>
      <div className="form-group">
        <label htmlFor="">Room Name</label>
        <span className="form-control">{data?.room_name}</span>
      </div>
      <div className="form-group">
        <label htmlFor="">Room Password</label>
        <span
          ref={copyRef}
          className="form-control copy"
          title={"Click to copy"}
          onClick={handleCopy}
        >
          {data?.room_password}
        </span>
      </div>
    </div>
  );
}

export default Setting;
