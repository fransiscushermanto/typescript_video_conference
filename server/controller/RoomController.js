const fs = require("fs");

const utils = require("../utils/Utils");

module.exports = {
  getRooms: async (req, res, next) => {
    const { user_id } = req.params;
    try {
      console.log("GET ROOMS");
      const rooms = await utils.getRooms(user_id);

      return res.status(200).send({
        success: true,
        rooms,
      });
    } catch (error) {
      return res.status(404).send({ message: "Not Found", error });
    }
  },
  createRoom: async (req, res, next) => {
    const { room_name, user_id } = req.body;
    try {
      await utils.createRoom({
        room_host: user_id,
        room_name,
      });
      return res.status(200).send({ message: "Room created successfully" });
    } catch (error) {
      return res.status(500).send({
        error,
        message: "Internal Server Error",
      });
    }
  },
  joinRoom: async (req, res, next) => {
    const { user_id, room_id, room_password } = req.body;
    try {
      if (await utils.checkUserRoom(user_id, room_id)) {
        return res.status(409).send({
          success: false,
          message: "You have joined this room",
        });
      }

      if (!(await utils.validateJoiningRoom(user_id, room_id, room_password))) {
        return res.status(400).send({
          success: false,
          message: "Password you provided is incorrect",
        });
      }

      return res.status(200).send({ success: true });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  deleteRoom: async (req, res, next) => {
    const { room_id } = req.params;
    const { user_id } = req.query;
    try {
      await utils.deleteRoom(room_id, user_id);
      return res.status(200).send({ room_id, user_id });
    } catch (error) {
      return res.send(error);
    }
  },
  getUserInfo: async (req, res, next) => {
    const { user_id } = req.body;
    try {
      const user = await utils.getUser(user_id);
      return res.status(200).send({ user_id, user_name: user.displayName });
    } catch (error) {
      return res.status(404).send({ message: "User not found" });
    }
  },
  getRoomNotifications: async (req, res, next) => {
    const { room_id, user_id } = req.params;
    try {
      const notifications = await utils.getRoomNotifications(user_id, room_id);
      return res.status(200).send({ notifications });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  getUsersInWaitingRoom: async (req, res, next) => {
    const { room_id } = req.params;
    try {
      const users = await utils.getUsersInWaitingRoom(room_id);
      return res.status(200).send({ users });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "An error occured" });
    }
  },
  updateParticipantsInWaitingRoom: async (req, res, next) => {
    const { user_id, room_id } = req.params;
    const { action } = req.body;

    try {
      await utils.updateUsersInWaitingRoom(room_id, user_id, action);
      return res.status(200).send({ user_id, room_id, action });
    } catch (error) {
      return res.status(500).send({ message: "An error occured" });
    }
  },
  getRoomParticipants: async (req, res, next) => {
    const { room_id } = req.params;
    const { user_id } = req.query;
    if (utils.checkUserRoom(user_id, room_id)) {
      return res.status(200).send({
        participants: await utils.getRoomParticipants(user_id, room_id),
      });
    } else {
      return res.status(200).send([]);
    }
  },
  checkUserRoom: async (req, res, next) => {
    const { user_id, room_id } = req.body;
    if (!user_id)
      return res.status(401).send({
        success: false,
        message: "Unauthenticated",
      });
    if (!(await utils.checkUserRoom(user_id, room_id))) {
      return res.status(400).send({
        success: false,
        message: "Room doesn't exist",
      });
    }
    return res.status(200).send({ success: true });
  },
  checkRoom: async (req, res, next) => {
    const { room_id } = req.body;
    try {
      if (await utils.existRoom(room_id)) {
        return res.status(204).send();
      }

      return res.status(422).send({ message: "Room not available" });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  getParticipants: (req, res, next) => {
    return res.status(200).send({
      success: true,
      participants: utils.getParticipants(),
    });
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
  getRoomDetails: (req, res, next) => {
    const { room_id } = req.query;
    if (utils.existMeetingRoom(room_id)) {
      return res.status(200).send(utils.getRoomDetails(room_id));
    }

    return res.status(200).send({});
  },
  updateRoom: (req, res, next) => {
    const { room_id, room_host, room_password } = req.body;
    try {
      if (utils.existMeetingRoom(room_id)) {
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
