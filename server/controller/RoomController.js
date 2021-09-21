const fs = require("fs");

const utils = require("../utils/RoomUtils");

module.exports = {
  createRoom: async (req, res, next) => {
    const { room_name, user_id } = req.body;
    const { success, message } = await utils.createRoom({
      room_host: user_id,
      room_name,
    });
    if (success) {
      return res.status(200).send({
        success,
        message,
      });
    } else {
      return res.status(500).send({
        success,
        message,
      });
    }
  },
  getRooms: async (req, res, next) => {
    const { user_id } = req.query;

    return res.status(200).send({
      success: true,
      rooms: await utils.getRooms(user_id),
    });
  },
  getParticipants: (req, res, next) => {
    return res.status(200).send({
      success: true,
      participants: utils.getParticipants(),
    });
  },
  checkRoom: (req, res, next) => {
    const { room_id } = req.body;
    if (!utils.existRoom(room_id)) {
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
      const host = utils.getRoomHost(room_id);
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
    const userId = utils.generateUserId();
    if (!utils.checkPassword(room_id, room_password)) {
      return res.status(400).send({
        success: false,
        message: "Password you provided is incorrect",
      });
    }
    return res.status(200).send({ success: true, user_id: userId });
  },
  getRoomParticipants: (req, res, next) => {
    const { room_id } = req.query;
    if (utils.existRoom(room_id)) {
      return res.status(200).send({
        participants: utils.getRoomParticipants(room_id),
        hosts: utils.getRoomHosts(room_id),
      });
    } else {
      return res.status(200).send([]);
    }
  },
  getRoomDetails: (req, res, next) => {
    const { room_id } = req.query;
    if (utils.existRoom(room_id)) {
      return res.status(200).send(utils.getRoomDetails(room_id));
    }

    return res.status(200).send({});
  },
  updateRoom: (req, res, next) => {
    const { room_id, room_host, room_password } = req.body;
    try {
      if (utils.existRoom(room_id)) {
        const result = utils.updateRoom({
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
