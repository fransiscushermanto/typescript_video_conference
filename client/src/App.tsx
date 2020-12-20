import React from "react";
import { Switch, Route } from "react-router-dom";
import { SnackbarProvider } from "./components/CustomSnackbar";
import { SocketProvider } from "./components/Providers/SocketProvider";
import MessageHandler from "./components/Handlers/MessageHandler";

import RoomGuard from "./components/HOC/RoomGuard";
import Home from "./components/Home";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import Room from "./components/RoomComponents/Room";
import AuthGuard from "./components/HOC/AuthGuard";

const App = (props) => {
  return (
    <SocketProvider>
      <SnackbarProvider maxStack={5} sort="asc">
        <MessageHandler />
      </SnackbarProvider>
      <Switch>
        <Route path="/login" component={AuthGuard(Login)} />
        <Route path="/" exact component={AuthGuard(Home)} />
        <Route path="/start/:room_id" component={RoomGuard(Room)} />
        <Route path="/join/:room_id" component={RoomGuard(Room)} />
        <Route path="*" component={NotFound} />
      </Switch>
    </SocketProvider>
  );
};

export default App;
