require("fs");
const { FirebaseAdmin } = require("../firebase/config");
const admin = new FirebaseAdmin();

let rooms = [];
let participants = [];
const ParticipantType = {
  HOST: "host",
  CO_HOST: "co-host",
  PARTICIPANT: "participant",
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
    } while (existRoom(room_id));

    newRoom = { room_id, room_host, room_password, room_name };
    await admin.createRoom(newRoom);
    return { success: true, message: "Success created room" };
  } catch (error) {
    return { success: false, message: "There is an error occurred" };
  }
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
 * @param {string} room_id
 * @param {string} room_password
 */
const validateRoomJoining = (room_id, room_password) => {
  if (existRoom(room_id)) {
    if (checkPassword(room_id, room_password)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
/**
 * @param {{user_id:string, name:string, room_id:string}} newParticipant
 */
const setParticipants = (newParticipant) => {
  if (!existUser(newParticipant.user_id)) {
    participants.push(newParticipant);
  }
};
/**
 * @param {string} room_id
 * @param {Object} options
 * @returns {Object} user
 */
const getSpecificParticipantInRoom = (room_id, options) => {
  let filtered;
  const option = Object.keys(options)[0];

  const participantsInRoom = [
    ...participants.filter((participant) => participant.room_id === room_id),
  ];

  switch (option) {
    case "socket_id":
      filtered = participantsInRoom.filter(
        (participant) => participant.socket_id === options.socket_id,
      )[0];
      break;
    case "user_id":
      filtered = participantsInRoom.filter(
        (participant) => participant.user_id === options.user_id,
      )[0];
      break;
    default:
      break;
  }

  return filtered;
};
/**
 * @param {number} length
 * @default length = 8
 */
const generate = (length = 8) => {
  const ALPHABET =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let rtn = "";
  for (let i = 0; i < length; i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return rtn;
};
/**
 *
 * @param {number} length
 * @returns {string} user_id
 * @default length = 15
 */
const generateUserId = (length = 15) => {
  let user_id;
  do {
    user_id = generate(15);
  } while (existUser(user_id));
  return user_id;
};
/**
 * @param {string} room_id
 * @param {string} room_password
 */
const checkPassword = (room_id, room_password) => {
  const room = rooms.filter((room) => room.room_id === room_id)[0];
  if (room.room_password === room_password) {
    return true;
  } else {
    return false;
  }
};
/**
 * @param {string} room_id
 */
const getRoomParticipants = (room_id) => {
  return participants.filter((participant) => participant.room_id === room_id);
};
/**
 *
 * @returns {Array} participants
 */
const getParticipants = () => {
  return participants;
};
/**
 *
 * @param {Object} options
 * @returns {Object} user
 */
const getParticipant = (options) => {
  let filtered;
  const option = Object.keys(options)[0];

  switch (option) {
    case "socket_id":
      filtered = participants.filter(
        (participant) => participant.socket_id === options.socket_id,
      )[0];
      break;
    case "user_id":
      filtered = participants.filter(
        (participant) => participant.user_id === options.user_id,
      )[0];
      break;
    default:
      break;
  }

  return filtered;
};
/**
 * @param {string} user_id
 */
const existUser = (user_id) => {
  if (
    participants.filter((participant) => participant.user_id === user_id)
      .length === 1
  ) {
    return true;
  } else {
    return false;
  }
};
/**
 * @param {string} room_id
 */
const existRoom = (room_id) => {
  if (rooms.filter((room) => room.room_id === room_id).length === 1) {
    return true;
  } else {
    return false;
  }
};
/**
 *
 * @param {Object} {room_id, room_host, room_password}
 * @returns {room_id, room_host, room_password}
 */
const updateRoom = ({ room_id, room_host, room_password }) => {
  const temp = [...rooms];
  const targetRoom = { ...rooms.filter((room) => room.room_id === room_id)[0] };
  const indexTargetRoom = temp.indexOf(targetRoom);
  temp[indexTargetRoom] = { room_id, room_host, room_password };
  rooms = temp;
  return { room_id, room_host, room_password };
};
/**
 * @param {object} newRoom
 */
const setRooms = (newRoom) => {
  rooms.push(newRoom);
};
/**
 *
 * @param {string} user_id
 */
const removeUserFromRoom = (user_id) => {
  let newHost,
    changeHost = false;
  if (participants.length > 0) {
    let leavingParticipants = participants.filter(
      (participant) => participant.user_id === user_id,
    )[0];
    if (leavingParticipants) {
      let remainingParticipants = participants.filter(
        (participant) =>
          participant.user_id !== user_id &&
          participant.room_id === leavingParticipants.room_id,
      );
      if (leavingParticipants.status === ParticipantType.HOST) {
        let roomCoHost = [
          ...getRoomHosts(leavingParticipants.room_id).filter(
            (host) => host.user_id !== user_id,
          ),
        ];
        if (roomCoHost.length > 0) {
          remainingParticipants.map((participant) => {
            if (participant.user_id === roomCoHost[0].user_id) {
              participant.status = ParticipantType.HOST;
            }
            newHost = participant;
            changeHost = true;
            return participant;
          });
        } else if (remainingParticipants.length > 0) {
          let index = Math.floor(Math.random() * remainingParticipants.length);
          remainingParticipants[index].status = ParticipantType.HOST;
          newHost = remainingParticipants[index];
          changeHost = true;
        }
      }

      participants = remainingParticipants;
      return {
        success: true,
        room_id: leavingParticipants.room_id,
        name: leavingParticipants.name,
        status: leavingParticipants.status,
        newHost: newHost,
        redirect: false,
        changeHost,
      };
    } else {
      return {
        success: true,
        redirect: true,
      };
    }
  } else {
    return { success: false };
  }
};
/**
 *
 * @param {string} room_id
 */
const getRoomHosts = (room_id) => {
  let roomParticipants = getRoomParticipants(room_id);
  let filtered = roomParticipants.filter(
    (participant) =>
      participant.status === ParticipantType.HOST ||
      participant.status === ParticipantType.CO_HOST,
  );
  return filtered;
};
/**
 *
 * @param {string} room_id
 */
const getRoomHost = (room_id) => {
  let roomParticipants = getRoomParticipants(room_id);
  return roomParticipants.filter(
    (participant) => participant.status === ParticipantType.HOST,
  )[0];
};
/**
 *
 * @param {string} room_id
 */
const endRoom = (room_id) => {
  let remainRooms = [...rooms.filter((room) => room.room_id !== room_id)];
  rooms = remainRooms;
};
/**
 *
 * @param {string} room_id
 * @returns {Object} room
 */
const getRoomDetails = (room_id) => {
  return rooms.filter((room) => room.room_id === room_id)[0];
};
/**
 *
 * @param {string} user_id
 * @returns
 */
const getUserData = (user_id) => {
  return participants.filter(
    (participant) => participant.user_id === user_id,
  )[0];
};

module.exports = {
  setRooms,
  getRooms,
  createRoom,
  existRoom,
  existUser,
  getRoomParticipants,
  checkPassword,
  generate,
  getSpecificParticipantInRoom,
  setParticipants,
  validateRoomJoining,
  removeUserFromRoom,
  getRoomHosts,
  ParticipantType,
  getRoomHost,
  endRoom,
  getRoomDetails,
  getUserData,
  updateRoom,
  generateUserId,
  getParticipants,
  getParticipant,
};
