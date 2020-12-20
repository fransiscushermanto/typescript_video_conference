const fs = require("fs");

const existRoom = require("../utils/RoomUtils").existRoom;
const createRoom = require("../utils/RoomUtils").createRoom;
const checkPassword = require("../utils/RoomUtils").checkPassword;
const getRoomParticipants = require("../utils/RoomUtils").getRoomParticipants;
const getRooms = require("../utils/RoomUtils").getRooms;
const getRoomHosts = require("../utils/RoomUtils").getRoomHosts;
const getRoomHost = require("../utils/RoomUtils").getRoomHost;
const getRoomDetails = require("../utils/RoomUtils").getRoomDetails;
const updateRoom = require("../utils/RoomUtils").updateRoom;
const generateUserId = require("../utils/RoomUtils").generateUserId;
const getParticipants = require("../utils/RoomUtils").getParticipants;

module.exports = {
  createRoom: async (req, res, next) => {
    const { room_name, user_id } = req.body;
    const { success, message } = await createRoom({ room_host: user_id, room_name });
    if (success) {
      return res.status(200).send({
        success,
        message,
      });
    } else {
      return res.status(500).send({
        success,
        message
      });
    }
  },
  getListRooms: (req, res, next) => {
    return res.status(200).send({
      success: true,
      rooms: getRooms(),
    });
  },
  getListParticipants: (req, res, next) => {
    return res.status(200).send({
      success: true,
      participants: getParticipants(),
    });
  },
  checkRoom: (req, res, next) => {
    const { room_id } = req.body;
    if (!existRoom(room_id)) {
      return res.status(400).send({
        success: false,
        message: "Room doesn't exist",
      });
    }
    return res.status(200).send({ success: true });
  },
  isHost: (req, res, next) => {
    const { user_id, room_id } = req.body;
    try {
      const host = getRoomHost(room_id);
      if (host.user_id !== user_id) {
        return res.status(200).send({ success: true, status: false });
      }
      return res.status(200).send({ success: true, status: true });
    } catch (error) {
      return res.status(400).send({ success: false, message: error });
    }
  },
  joinRoom: (req, res, next) => {
    const { room_id, room_password } = req.body;
    const userId = generateUserId();
    if (!checkPassword(room_id, room_password)) {
      return res.status(400).send({
        success: false,
        message: "Password you provided is incorrect",
      });
    }
    return res.status(200).send({ success: true, user_id: userId });
  },
  getRoomParticipants: (req, res, next) => {
    const { room_id } = req.query;
    if (existRoom(room_id)) {
      return res.status(200).send({
        participants: getRoomParticipants(room_id),
        hosts: getRoomHosts(room_id),
      });
    } else {
      return res.status(200).send([]);
    }
  },
  getRoomDetails: (req, res, next) => {
    const { room_id } = req.query;
    if (existRoom(room_id)) {
      return res.status(200).send(getRoomDetails(room_id));
    }

    return res.status(200).send({});
  },
  updateRoom: (req, res, next) => {
    const { room_id, room_host, room_password } = req.body;
    try {
      if (existRoom(room_id)) {
        const result = updateRoom({
          room_id,
          room_host,
          room_password,
        });
        return res.status(200).send({ success: true, data: result });
      }
      return res.status(400).send({ success: false });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ success: false });
    }
  },
  flushRoom: (req, res, next) => {
    rooms = [];
    res.status(200).send({ success: true, rooms });
  },
};
