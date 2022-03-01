require("fs");
const { admin } = require("../firebase/config");

const ParticipantType = require("./types");
const socket = require("../../index").io;
const helper = require("./helper");

const user_sockets = {};

/**
 *
 * @param {string} user_id
 * @returns {object} user
 */
const getUser = async (user_id) => {
  return await admin.getUser(user_id);
};

const existRoom = async (room_id) => {
  return await admin.existRoom(room_id);
};

/**
 * @param {Object} {room_host, room_name}
 */
const createRoom = async ({ room_host, room_name }) => {
  let newRoom, room_id, room_password;

  do {
    room_id = helper.generate(10);
    room_password = helper.generate(10);
  } while (await existRoom(room_id));

  newRoom = {
    room_id,
    room_host,
    room_password,
    room_name,
    room_participants: [
      {
        user_id: room_host,
        role: ParticipantType.HOST,
      },
    ],
  };
  return await admin.createRoom(newRoom);
};

const validateJoiningRoom = async (user_id, room_id, room_password) => {
  if (await admin.validateRoomPassword(room_id, room_password)) {
    await admin.joinRoom(room_id, {
      user_id,
      status: ParticipantType.PARTICIPANT,
    });
    socket
      .to(room_id)
      .emit("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", { type: "add" });
    return true;
  }

  return false;
};

/**
 *
 * @param {string} user_id
 * @returns {Array} rooms
 */
const getRooms = async (user_id) => {
  return await admin.getRooms(user_id);
};

const getRoomNotifications = async (user_id, room_id) => {
  return await admin.getRoomNotifications(user_id, room_id);
};

/**
 *
 * @param {string} user_id
 * @param {string} room_id
 * @returns true | false
 */
const checkUserRoom = async (user_id, room_id) => {
  return await admin.checkUserRoom(user_id, room_id);
};

const getRoomParticipants = async (user_id, room_id) => {
  const room_participants = await admin.getRoomParticipants(user_id, room_id);

  const participants = room_participants?.map(async (participant) => {
    const userData = await admin.getUser(participant.user_id);
    return {
      ...participant,
      user_name: userData.displayName,
    };
  });

  return await Promise.all(participants);
};

/**
 *
 * @param {string} room_id
 * @returns {User[]}
 */
const getUsersInWaitingRoom = async (room_id) => {
  return await admin.getUsersInWaitingRoom(room_id);
};

const updateUsersInWaitingRoom = async (room_id, user_id, action) => {
  switch (action) {
    case "accept":
      await admin.acceptUserToRoom(room_id, user_id);
      break;

    case "reject":
      await admin.rejectUserToRoom(room_id, user_id);
      break;
  }
  socket.to(user_sockets[user_id]).emit("UPDATE_USER_ROOMS", {
    type: action === "reject" ? "delete" : "update",
    debug: user_sockets,
  });
  socket.in(room_id).emit("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", {
    type: action === "reject" ? "delete" : "update",
  });
  return;
};

async function deleteRoom(room_id, user_id) {
  const res = await admin.deleteRoom(room_id, user_id);
  socket
    .to(room_id)
    .emit("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", { type: "delete" });
  socket.emit("UPDATE_USER_ROOMS", { type: "delete" });
  socket.leave(room_id);
  return res;
}

async function createMeeting(room_id, user_id, meeting_name) {
  return await admin.createMeeting(room_id, user_id, meeting_name);
}

async function deleteMeeting(room_id, meeting_id) {
  return await admin.deleteMeeting(room_id, meeting_id);
}

async function getRoomMeeting(room_id, meeting_id) {
  return await admin.getRoomMeeting(room_id, meeting_id);
}

async function getRoomMeetings(room_id) {
  return await admin.getRoomMeetings(room_id);
}

async function checkMeeting(room_id, meeting_id) {
  return await admin.checkMeeting(room_id, meeting_id);
}

async function storeRoomUserFace(
  room_id,
  user_id,
  face_description,
  preview_image,
) {
  await admin.storeRoomUserFace(
    room_id,
    user_id,
    face_description,
    preview_image,
  );

  return socket.to(room_id).emit("GET_SAVED_IMAGE");
}

async function getRoomUserFaces(room_id, user_id) {
  try {
    const faces = await admin.getRoomUserFaces(room_id, user_id);
    return faces
      ? Object.entries(faces).map(([face_id, payload]) => ({
          face_id,
          ...payload,
          created_at: payload.created_at?.toDate?.(),
        }))
      : undefined;
  } catch (error) {
    throw error;
  }
}

async function getRoomFaces(room_id) {
  try {
    const room_faces = await admin.getRoomFaces(room_id);

    return room_faces;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUser,
  createRoom,
  validateJoiningRoom,
  existRoom,
  getRooms,
  checkUserRoom,
  getRoomParticipants,
  getUsersInWaitingRoom,
  updateUsersInWaitingRoom,
  deleteRoom,
  createMeeting,
  deleteMeeting,
  getRoomMeeting,
  getRoomMeetings,
  getRoomNotifications,
  user_sockets,
  checkMeeting,
  storeRoomUserFace,
  getRoomUserFaces,
  getRoomFaces,
};
