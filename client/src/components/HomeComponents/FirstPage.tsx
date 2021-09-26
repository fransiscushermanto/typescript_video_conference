import { css } from "@emotion/css";
import React, { useEffect } from "react";
import { QueryClient } from "react-query";
import { useMe, useRoom } from "../../hooks";
import { useGetRooms } from "../api-hooks";
import { RoomCard } from "./firstPageComp";

interface Props {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

const styled = {
  roomWrapper: css`
    width: 1280px;
    height: 600px;
    max-height: 700px;
    overflow-y: auto;
    display: grid;
    grid-gap: 1.25rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, max-content));
    grid-template-rows: repeat(auto-fill, minmax(300px, max-content));
  `,
  btnWrapper: css`
    width: 1280px;
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
  const queryClient = new QueryClient();
  const { setCurrentPage } = props;
  const [me] = useMe();

  const {
    data: rooms,
    isLoading,
    isFetching,
  } = useGetRooms(me && me.user_id, {
    enabled: !!(me && me.user_id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    queryClient.resetQueries("rooms");
  }, []);

  return (
    <>
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
        {!isLoading &&
          !isFetching &&
          rooms &&
          rooms.map((room, i) => <RoomCard key={i} room={room} />)}
      </div>
    </>
  );
}

export default FirstPage;
