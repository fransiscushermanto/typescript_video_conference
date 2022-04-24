import React, { useContext, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { HomePages } from "./constants";
import FirstPage from "./HomeComponents/FirstPage";
import JoinPage from "./HomeComponents/JoinPage";
import CreatePage from "./HomeComponents/CreatePage";
import LogOutSVG from "../assets/logout.svg";
import * as yup from "yup";
import { RouteComponentProps } from "react-router-dom";
import * as H from "history";
import { useAuth, useMe } from "../hooks";
import { css } from "@emotion/css";
import { MessageContext } from "./Providers/MessageProvider";
import { Severities } from "./CustomSnackbar";
import { useCreateRoom } from "./api-hooks";
import { callAllFunctions } from "./helper";
import useSocket from "./../hooks/use-socket";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

const styled = {
  header: css`
    width: 100%;
    display: flex;
    flex-direction: row;
    height: 70px;
    padding: 0.625rem 2.5rem;
    margin-bottom: 1.25rem;
  `,
  logout: css`
    margin-left: auto;
    background-color: transparent;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
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
  const socket = useSocket();
  const { logout } = useAuth();

  const [me] = useMe();
  const [messages, setMessages] = useContext(MessageContext);
  const [currentPage, setCurrentPage] = useState<HomePages>(HomePages.DEFAULT);
  const { mutateAsync: mutateAsyncCreateRoom, isLoading: isLoadingCreateRoom } =
    useCreateRoom({
      onSuccess: ({ message }) => {
        setMessages([
          ...messages,
          {
            id: Date.now(),
            message: message,
            severity: Severities.SUCCESS,
          },
        ]);
        setCurrentPage(HomePages.DEFAULT);
      },
      onError: (error) => {
        const { message } = error.response.data;
        setMessages([
          ...messages,
          {
            id: Date.now(),
            message: message,
            severity: Severities.ERROR,
          },
        ]);
      },
    });

  const formContext = useForm({
    resolver: yupResolver(
      currentPage === "join"
        ? joinSchema
        : currentPage === "create"
        ? createSchema
        : null,
    ),
  });

  const { handleSubmit, register, errors } = formContext;

  const onSubmit = async (formData: {
    room_id: string;
    room_password: string;
    user_id: string;
    room_name: string;
  }): Promise<void> => {
    switch (currentPage) {
      case HomePages.CREATE:
        if (!isLoadingCreateRoom) {
          await mutateAsyncCreateRoom({
            room_name: formData.room_name,
            user_id: me.user_id,
          });
        }
        break;
      case HomePages.JOIN:
        setCurrentPage(HomePages.DEFAULT);
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

  return (
    <FormProvider {...formContext}>
      <div className="home-wrapper wrapper">
        <header className={styled.header}>
          <button
            onClick={callAllFunctions(() => socket.disconnect(), logout)}
            className={styled.logout}
          >
            <img src={LogOutSVG} alt="logout" />
          </button>
        </header>
        {renderPage()}
      </div>
    </FormProvider>
  );
};

export default Home;
