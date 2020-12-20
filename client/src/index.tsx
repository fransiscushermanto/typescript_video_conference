import * as React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { RoomProvider } from "./components/Providers/RoomProvider";
import { MessageProvider } from "./components/Providers/MessageProvider";

import "./sass/style.scss";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { FirebaseProvider } from "./components/Providers/FirebaseProvider";
import { AuthProvider } from "./components/Providers/AuthProvider";
ReactDOM.render(
  <BrowserRouter>
    <FirebaseProvider>
      <RoomProvider>
        <AuthProvider>
          <MessageProvider>
            <App />
          </MessageProvider>
        </AuthProvider>
      </RoomProvider>
    </FirebaseProvider>
  </BrowserRouter>,
  document.getElementById("root"),
);
