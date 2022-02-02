require("fs");
const { admin } = require("../firebase/config");
const io = require("../../index").io;
const { user_sockets } = require("../utils/Utils");

module.exports = function (socket) {
  io.on("connect", () => {
    console.log(`${socket.id} is connected`);
  });

  socket.on("disconnect", () => {
    if (user_sockets) {
      const [user_id] =
        Object.entries(user_sockets || {}).find(
          ([, user_socket_id]) => user_socket_id === socket.id,
        ) || [];
      delete user_sockets[user_id];
    }

    console.log(`${socket.id} is disconnected`);
  });

  socket.on("LIST_USER_SOCKET", ({ me }) => {
    if (!user_sockets[me.user_id]) {
      user_sockets[me.user_id] = socket.id;
    }
  });

  socket.on("JOIN_ROOM", ({ room_id }) => {
    socket.join(room_id);
  });

  socket.on("UPDATE_ROOM_NOTIFICATION", async ({ user_id, room_id, notif }) => {
    try {
      await admin.updateRoomNotification(user_id, room_id, notif);
      socket.emit("GET_ROOM_NOTIFICATION");
    } catch (error) {
      console.log("error", error);
    }
  });
  // socket.on("JOIN_NEW_ROOM", ({ room_id, name, user_id }) => {
  //   setParticipants({
  //     user_id: user_id,
  //     user_name: name,
  //     room_id,
  //     socket_id: socket.id,
  //     role: ParticipantType.HOST,
  //   });
  //   socket.join(room_id);
  // });
  // socket.on("JOIN_EXIST_ROOM", ({ room_id, name, user_id }) => {
  //   if (getRoomHost(room_id) === undefined) {
  //     setParticipants({
  //       user_id: user_id,
  //       user_name: name,
  //       room_id,
  //       socket_id: socket.id,
  //       role: ParticipantType.HOST,
  //     });
  //   } else {
  //     setParticipants({
  //       user_id: user_id,
  //       user_name: name,
  //       room_id,
  //       socket_id: socket.id,
  //       role: ParticipantType.PARTICIPANT,
  //     });
  //   }
  //   socket.to(room_id).emit("WELCOME", {
  //     message: `${name} joined the room`,
  //     room_participants: {
  //       participants: getRoomParticipants(room_id),
  //       hosts: getRoomHosts(room_id),
  //     },
  //     new_peer_id: peer_id,
  //   });
  //   socket.join(room_id);
  // });
};
