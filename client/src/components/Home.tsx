import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { HomePages } from "./constants";
import FirstPage from "./HomeComponents/FirstPage";
import JoinPage from "./HomeComponents/JoinPage";
import CreatePage from "./HomeComponents/CreatePage";
import axios from "../axios-instance";
import LogOutSVG from "../assets/logout.svg";
import * as yup from "yup";
import { RouteComponentProps } from "react-router-dom";
import * as H from "history";
import { useAuth, useFirebase, useRoom } from "../hooks";
import { css } from "@emotion/css";
import { MessageContext } from "./Providers/MessageProvider";
import { Severities } from "./CustomSnackbar";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

const styled = {
  logout: css`
    position: absolute;
    background-color: transparent;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    top: 2%;
    right: 1%;
    > img {
      width: 100%;
      height: 100%;
    }
  `,
};

const Home: React.FC<Props> = ({ history }) => {
  const joinSchema = yup.object().shape({
    room_id: yup.string().required("This field is required"),
  });

  const createSchema = yup.object().shape({
    room_name: yup.string().required("This field is required"),
  });

  const { logout } = useAuth();
  const { meState } = useRoom();

  const [me] = meState;
  const [messages, setMessages] = useContext(MessageContext);
  const [currentPage, setCurrentPage] = useState<HomePages>(HomePages.DEFAULT);

  const { handleSubmit, register, errors } = useForm({
    resolver: yupResolver(
      currentPage === "join"
        ? joinSchema
        : currentPage === "create"
        ? createSchema
        : null,
    ),
  });

  const onSubmit = async (formData: {
    room_id: string;
    room_password: string;
    user_id: string;
    room_name: string;
  }): Promise<void> => {
    let res;
    switch (currentPage) {
      case HomePages.CREATE:
        try {
          res = await axios.post("/api/createRoom", {
            room_name: formData.room_name,
            user_id: me.user_id,
          });

          // if (res.data.success) {
          //   history.push(`/start/${res.data.newRoom.room_id}`);
          // }
        } catch (error) {
          const { message } = error.response.data;
          setMessages([
            ...messages,
            {
              id: Date.now(),
              message: message,
              severity: Severities.ERROR,
            },
          ]);
        }
        break;
      case HomePages.JOIN:
        history.push(`/join/${formData.room_id}`);
        break;
      default:
        break;
    }
  };

  function renderPage() {
    switch (currentPage) {
      case HomePages.DEFAULT:
        return <FirstPage setCurrentPage={setCurrentPage} />;
      case HomePages.JOIN:
        return (
          <JoinPage
            errors={errors}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            setCurrentPage={setCurrentPage}
          />
        );
      case HomePages.CREATE:
        return (
          <CreatePage
            errors={errors}
            register={register}
            handleSubmit={handleSubmit(onSubmit)}
            setCurrentPage={setCurrentPage}
          />
        );

      default:
        break;
    }
  }

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    console.log(me);
  }, [me]);

  return (
    <>
      <button onClick={logout} className={styled.logout}>
        <img src={LogOutSVG} alt="logout" />
      </button>
      <div className="home-wrapper wrapper">{renderPage()}</div>
    </>
  );
};

export default Home;
