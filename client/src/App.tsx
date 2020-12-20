import React, { useContext } from "react";
import { RoomDetailContext } from "./components/providers/RoomDetailProvider";
import VideoHandler from "./components/VideoHandler";
function App() {
  const { roomPermission } = useContext(RoomDetailContext);
  const [permission, setPermission] = roomPermission;

  return (
    <div className="App">
      <VideoHandler />
      <button onClick={() => {
        setPermission({ ...permission, camera: permission.camera ? false : true })
      }}>Camera</button>
    </div>
  );
}

export default App;
