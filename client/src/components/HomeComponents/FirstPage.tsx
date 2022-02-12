import { css } from "@emotion/css";
import React from "react";
import { useMe } from "../../hooks";
import { useGetRooms } from "../api-hooks";
import { RoomCard } from "./firstPageComp";

interface Props {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

const styled = {
  root: css`
    width: 100%;
    max-width: 100%;
    height: calc(100% - 70px);
    display: flex;
    flex-direction: column;
    padding: 0 2.5rem;
  `,
  roomWrapper: css`
    width: 100%;
    height: 100%;
    max-height: 700px;
    overflow-y: auto;
    display: grid;
    grid-gap: 1.25rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, max-content));
    grid-template-rows: repeat(auto-fill, minmax(300px, max-content));
  `,
  btnWrapper: css`
    width: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
    margin-bottom: 0.625rem;
    .inner-wrapper {
      .btn {
        &:not(:last-child) {
          margin-right: 0.625rem;
        }
        background-color: white;
      }
    }
  `,
};

function FirstPage(props: Props) {
  const { setCurrentPage } = props;
  const [me] = useMe();

  const { rooms } = useGetRooms({
    enabled: !!me?.user_id,
    refetchOnWindowFocus: false,
  });

  return (
    <div className={styled.root}>
      <div className={styled.btnWrapper}>
        <div className="inner-wrapper">
          <button onClick={() => setCurrentPage("join")} className="btn">
            Join Room
          </button>
          <button onClick={() => setCurrentPage("create")} className="btn">
            Create Room
          </button>
        </div>
      </div>
      <div className={styled.roomWrapper}>
        {rooms?.map((room, i) => (
          <RoomCard key={i} room={room} />
        ))}
      </div>
    </div>
  );
}

export default FirstPage;
