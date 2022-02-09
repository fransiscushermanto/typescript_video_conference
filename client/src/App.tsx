import { Switch, Route } from "react-router-dom";
import { SnackbarProvider } from "./components/CustomSnackbar";
import MessageHandler from "./components/Handlers/MessageHandler";

import PageGuard from "./components/HOC/PageGuard";
import Home from "./components/Home";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
// import VideoRoom from "./components/MeetingRoomComponents/VideoRoom";
import AuthGuard from "./components/HOC/AuthGuard";
import Room from "./components/RoomComponents/Room";

const App = (props) => {
  return (
    <>
      <SnackbarProvider maxStack={5} sort="asc">
        <MessageHandler />
      </SnackbarProvider>
      <Switch>
        <Route path="/login" component={AuthGuard(Login)} />
        <Route path="/" exact component={AuthGuard(Home)} />
        <Route path="/room/:room_id" component={PageGuard(Room)} />
        {/* <Route path="/start/:meeting_id" component={RoomGuard(VideoRoom)} />
        <Route path="/join/:meeting_id" component={RoomGuard(VideoRoom)} /> */}
        <Route path="*" component={NotFound} />
      </Switch>
    </>
  );
};

export default App;
