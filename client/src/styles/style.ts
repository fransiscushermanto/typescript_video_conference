import { css } from "@emotion/react";

export default css`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  body,
  #root {
    overflow: hidden;
  }

  .error {
    color: var(--third-color);
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 1.1%;
    transition: all 0.5s ease-in;
    z-index: 20;
  }

  #root {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;

    background-color: var(--primary-color);
    .wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      &.home-wrapper {
        flex-direction: column;
        align-items: center;
        > .form-wrapper {
          transform: translateY(50%);
          display: block;
          width: 450px;
          height: 300px;
          &.action-btn-wrapper > .inner-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            height: 100%;

            padding: 0px 30px;
            .btn {
              background-color: white;
              &:not(:last-child) {
                margin-bottom: 10px;
              }
              font-weight: bold;
              transition: all ease-in 0.3s;
              &:hover {
                opacity: 0.6;
              }
            }
          }
          &.form-wrapper > form {
            width: 100%;
            height: 100%;

            display: flex;
            flex-direction: column;
            justify-content: center;

            padding: 0px 30px;

            label {
              color: white;
            }
          }
        }
      }
      &.room-wrapper {
        flex-direction: column;
        .main {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          .video-wrapper {
            width: 100%;
            height: auto;
            display: grid;
            justify-content: center;
            align-items: center;
            grid-template-columns: repeat(auto-fit, minmax(300px, auto));
            grid-template-rows: repeat(auto-fit, minmax(300px, auto));
          }
        }
      }
    }
    header {
      height: auto;
      /* background-color: rgba(0, 0, 0, 0.5); */
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    footer {
      height: auto;
      min-height: 70px;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: row;
      align-items: center;
      .btn-leave-wrapper {
        margin-left: auto;
        padding: 0px 10px;
        .btn-leave {
          color: white;
          font-size: 16px;
          font-weight: bold;
          background: red;
          border: none;
          border-radius: 10px;
          padding: 5px 15px;
          transition: all ease 0.5s;
          &:hover {
            background: darkred;
          }
        }
      }
      .audio-wrapper,
      .camera-wrapper {
        width: 90px;
        height: 70px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        > div {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          span {
            font-size: 13px;
            user-select: none;
          }
          .image-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }
  }

  .modal-backdrop {
    color: black;
    position: absolute;
    top: 0%;
    left: 0%;
    height: 100%;
    width: 100%;

    background-color: rgba(0, 0, 0, 0.5);

    .modal-content {
      background-color: rgb(255, 255, 255);
      border-radius: 10px;

      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      .modal-header {
        align-items: center;
        border-bottom: none;
        .title {
          font-weight: bold;
          font-size: 20px;
        }
        .close {
          display: flex;
          align-items: center;

          padding: unset;
          margin: unset;

          cursor: pointer;
        }
      }

      .modal-body {
        display: flex;
        height: 100%;
        width: 100%;
      }
    }
  }

  .form-group {
    label {
      font-size: 0.875rem;
      font-weight: bold;
    }
    .error {
      margin-top: 0.5rem;
      font-size: 0.75rem;
    }
  }

  video {
    background-color: black;
    width: 100%;
    height: 100%;
  }
`;
