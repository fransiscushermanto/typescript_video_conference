require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const favicon = require("express-favicon");
const path = require("path");
const cors = require("cors");
const port = process.env.PORT || 8000;
const http = require("http").createServer(app);
const socketIo = require("socket.io");
const io = (module.exports.io = socketIo(http, {
  cors: {
    origin: "*",
  },
}));
const ionsp = (module.exports.ionsp = io.of(/^\/\w+$/));

app.set("socket", io);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
if (process.env.NODE_ENV !== "test") {
  app.use(favicon(path.join(__dirname, "client", "build", "favicon.io")));
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", function (req, res) {
    const index = path.join(__dirname, "client", "build", "index.html");
    res.sendFile(index);
  });
}

app.use("/api", require("./server/routes/api"));

http.listen(port, () => {
  console.log(`Products server listening on port ${port}`);
});

const SocketController = require("./server/controller/SocketController");
const RoomSocketController = require("./server/controller/RoomSocketController");

io.on("connection", (socket) => SocketController(socket, io));
ionsp.on("connection", (socket) => RoomSocketController(socket, ionsp));
