require("fs");
const { FirebaseAdmin } = require("../firebase/config");
const admin = new FirebaseAdmin();
const ParticipantType = require("./types");

/**
 *
 * @param {string} user_id
 * @returns {object} user
 */
const getUser = async (user_id) => {
  return await admin.getUser(user_id);
};

/**
 * @param {Object} {room_host, room_name}
 */
const createRoom = async ({ room_host, room_name }) => {
  let newRoom, room_id, room_password;
  try {
    do {
      room_id = generate(10);
      room_password = generate(10);
    } while (existMeetingRoom(room_id));

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
    await admin.createRoom(newRoom);
    return { success: true, message: "Success created room" };
  } catch (error) {
    return { success: false, message: "There is an error occurred" };
  }
};

const validateJoiningRoom = async (user_id, room_id, room_password) => {
  if (await admin.validateRoomPassword(room_id, room_password)) {
    await admin.joinRoom(room_id, {
      user_id,
      status: ParticipantType.PARTICIPANT,
    });
    return true;
  }

  return false;
};

const checkRoom = async (room_id) => {
  return await admin.checkRoom(room_id);
};

/**
 *
 * @param {string} user_id
 * @returns {Array} rooms
 */
const getRooms = async (user_id) => {
  return await admin.getRooms(user_id);
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

  const participants = room_participants.map(async (participant) => {
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
      return await admin.acceptUserToRoom(room_id, user_id);

    case "reject":
      return await admin.rejectUserToRoom(room_id, user_id);
  }
};

async function deleteRoom(room_id, user_id) {
  return await admin.deleteRoom(room_id, user_id);
}

async function createMeeting(room_id, meeting_name, offer) {
  return await admin.createMeeting(room_id, meeting_name, offer);
}

async function getRoomMeetings(room_id) {
  return await admin.getRoomMeetings(room_id);
}

module.exports = {
  getUser,
  createRoom,
  validateJoiningRoom,
  checkRoom,
  getRooms,
  checkUserRoom,
  getRoomParticipants,
  getUsersInWaitingRoom,
  updateUsersInWaitingRoom,
  deleteRoom,
  createMeeting,
  getRoomMeetings,
};
