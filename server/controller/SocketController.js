require("fs");
const { admin } = require("../firebase/config");
const { user_sockets, rooms } = require("../utils/Utils");
const Roles = require("../utils/types");

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

  socket.on("JOIN_ROOM", async ({ room_id, me }) => {
    if (me) {
      const participant = await admin.getRoomParticipant(me.user_id, room_id);
      if (rooms[room_id]) {
        rooms[room_id] = [
          ...rooms[room_id].filter(
            (participant) => participant.user_id !== me.user_id,
          ),
          { user_id: me.user_id, role: participant?.role || Roles.PARTICIPANT },
        ];
      } else {
        rooms[room_id] = [
          { user_id: me.user_id, role: participant?.role || Roles.PARTICIPANT },
        ];
      }
    }

    socket.join(room_id);
  });

  socket.on("LEAVE_ROOM", ({ room_id, me }) => {
    if (rooms[room_id]) {
      const participant = rooms[room_id].find(
        (participant) => participant.user_id === me.user_id,
      );

      if (participant?.role === Roles.HOST) {
        delete rooms[room_id];
      } else {
        rooms[room_id] = rooms[room_id].filter(
          (participant) => participant.user_id !== me.user_id,
        );
      }
    }

    socket.leave(room_id);
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
