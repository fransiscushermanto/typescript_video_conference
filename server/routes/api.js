require("express");
const router = require("express-promise-router")();
const RoomController = require("../controller/RoomController");

router.route("/createRoom").post(RoomController.createRoom);
router.route("/joinRoom").post(RoomController.joinRoom);
router.route("/getRooms").get(RoomController.getRooms);
router.route("/checkUserRoom").post(RoomController.checkUserRoom);
router.route("/checkRoom").post(RoomController.checkRoom);
router.route("/isHost").post(RoomController.isHost);
router.route("/getRoomParticipants").get(RoomController.getRoomParticipants);
router.route("/getParticipants").get(RoomController.getParticipants);
router.route("/getRoomDetails").get(RoomController.getRoomDetails);
router.route("/getUserInfo").post(RoomController.getUserInfo);
router.route("/updateRoom").post(RoomController.updateRoom);
router.route("/flushRoom").get(RoomController.flushRoom);

module.exports = router;
