require("fs");

const io = require("../../index").io;
const setParticipants = require("../utils/RoomUtils").setParticipants;
const ParticipantType = require("../utils/RoomUtils").ParticipantType;
const removeUserFromRoom = require("../utils/RoomUtils").removeUserFromRoom;
const getRoomHost = require("../utils/RoomUtils").getRoomHost;
const getRoomHosts = require("../utils/RoomUtils").getRoomHosts;
const getUserData = require("../utils/RoomUtils").getUserData;
const getRoomDetails = require("../utils/RoomUtils").getRoomDetails;
const getRoomParticipants = require("../utils/RoomUtils").getRoomParticipants;
const getParticipant = require("../utils/RoomUtils").getParticipant;
const updateRoom = require("../utils/RoomUtils").updateRoom;

module.exports = function (socket) {
  socket.on("disconnect", () => {
    const leavingUser = getParticipant({ socket_id: socket.id });
    if (leavingUser) {
      socket
        .to(leavingUser.room_id)
        .emit("LEAVING", `${leavingUser.user_name} left the room`);
      // const data = removeUserFromRoom(leavingUser.user_id);
      // if (data.success) {
      //   const { room_id, name, newHost, role, changeHost } = data;

      //   // if (status === ParticipantType.HOST && changeHost) {
      //   //   let prevRoomDetail = getRoomDetails(room_id);
      //   //   let user = getUserData(newHost.user_id);
      //   //   let room = updateRoom({
      //   //     room_id,
      //   //     room_host: user.user_id,
      //   //     room_password: prevRoomDetail.room_password,
      //   //   });
      //   //   if (room) {
      //   //     room["room_participants"] = {
      //   //       participants: getRoomParticipants(room_id),
      //   //       hosts: getRoomHosts(room_id),
      //   //     };
      //   //     io.to(newHost.socket_id).emit("NEW_HOST", {
      //   //       message: "You are the host now.",
      //   //       user,
      //   //       room,
      //   //     });
      //   //   }
      //   // }
      // }
    }
    console.log(`${socket.id} is disconnected`);
  });

  socket.on("JOIN_NEW_ROOM", ({ room_id, name, user_id }) => {
    setParticipants({
      user_id: user_id,
      user_name: name,
      room_id,
      socket_id: socket.id,
      role: ParticipantType.HOST,
    });
    socket.join(room_id);
  });
  socket.on("JOIN_EXIST_ROOM", ({ room_id, name, user_id }) => {
    if (getRoomHost(room_id) === undefined) {
      setParticipants({
        user_id: user_id,
        user_name: name,
        room_id,
        socket_id: socket.id,
        role: ParticipantType.HOST,
      });
    } else {
      setParticipants({
        user_id: user_id,
        user_name: name,
        room_id,
        socket_id: socket.id,
        role: ParticipantType.PARTICIPANT,
      });
    }
    socket.to(room_id).emit("WELCOME", {
      message: `${name} joined the room`,
      room_participants: {
        participants: getRoomParticipants(room_id),
        hosts: getRoomHosts(room_id),
      },
      new_peer_id: peer_id,
    });
    socket.join(room_id);
  });
};

module.exports.ParticipantType = ParticipantType;
