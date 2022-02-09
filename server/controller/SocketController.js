require("fs");
const { admin } = require("../firebase/config");
const { user_sockets, rooms } = require("../utils/Utils");

module.exports = function (socket, io) {
  console.log(`${socket.id} is connected`);

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
};
