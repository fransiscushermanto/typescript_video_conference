require("express");
const router = require("express-promise-router")();
const RoomController = require("../controller/RoomController");

router.route("/rooms/create").post(RoomController.createRoom);
router.route("/rooms/join").post(RoomController.joinRoom);
router.route("/rooms").get(RoomController.getRooms);
router
  .route("/rooms/participants/waiting")
  .get(RoomController.getUsersInWaitingRoom);
router.route("/rooms/check").post(RoomController.checkRoom);
router.route("/isHost").post(RoomController.isHost);
router.route("/getRoomParticipants").get(RoomController.getRoomParticipants);
router.route("/getParticipants").get(RoomController.getParticipants);
router.route("/getRoomDetails").get(RoomController.getRoomDetails);
router.route("/users/check-room").post(RoomController.checkUserRoom);
router.route("/users/info").post(RoomController.getUserInfo);
router.route("/updateRoom").post(RoomController.updateRoom);
router.route("/flushRoom").get(RoomController.flushRoom);

module.exports = router;
