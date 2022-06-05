import { css } from "@emotion/css";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as H from "history";
import GoogleSVG from "../assets/google.svg";
import { useAuth } from "../hooks";

interface Props extends RouteComponentProps {
  history: H.History<H.LocationState>;
}

const styled = {
  wrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  `,
  signIn: css`
    width: 18.75rem;
    border: none;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 3rem;
    background-color: white;
    font-weight: 600;
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.54);
    padding: 0.5rem;
    letter-spacing: 1px;
    &:focus {
      outline: none;
    }
  `,
  google: css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2rem;
    height: 2rem;
    margin-right: 1.5rem;
    > img {
      width: 100%;
      height: 100%;
    }
  `,
};

function Login(props: Props) {
  const { login } = useAuth();

  return (
    <div className={styled.wrapper}>
      <button className={styled.signIn} onClick={login}>
        <div className={styled.google}>
          <img src={GoogleSVG} alt="google" />
        </div>
        <span>Login with Google</span>
      </button>
    </div>
  );
}

export default Login;
