require("express");
const router = require("express-promise-router")();
const RoomController = require("../controller/RoomController");

router.route("/createRoom").post(RoomController.createRoom);
router.route("/joinRoom").post(RoomController.joinRoom);
router.route("/getListRooms").get(RoomController.getListRooms);
router.route("/checkRoom").post(RoomController.checkRoom);
router.route("/isHost").post(RoomController.isHost);
router.route("/getRoomParticipants").get(RoomController.getRoomParticipants);
router.route("/getListParticipants").get(RoomController.getListParticipants);
router.route("/getRoomDetails").get(RoomController.getRoomDetails);
router.route("/updateRoom").post(RoomController.updateRoom);
router.route("/flushRoom").get(RoomController.flushRoom);

module.exports = router;
