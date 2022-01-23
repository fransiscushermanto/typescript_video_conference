require("express");
const router = require("express-promise-router")();
const RoomController = require("../controller/RoomController");
const MeetingController = require("../controller/MeetingController");

router.route("/rooms/create").post(RoomController.createRoom);
router.route("/rooms/join").post(RoomController.joinRoom);
router.route("/rooms/verify").post(RoomController.checkRoom);
router.route("/rooms/verifyHost").post(RoomController.isHost);
router.route("/rooms/:room_id").delete(RoomController.deleteRoom);
router
  .route("/rooms/:room_id/participants")
  .get(RoomController.getRoomParticipants);
router
  .route("/rooms/:room_id/participants/waiting")
  .get(RoomController.getUsersInWaitingRoom);
router
  .route("/rooms/:room_id/participants/waiting/:user_id")
  .post(RoomController.updateParticipantsInWaitingRoom);
router.route("/:user_id/rooms").get(RoomController.getRooms);
router.route("/getParticipants").get(RoomController.getParticipants);
router.route("/getRoomDetails").get(RoomController.getRoomDetails);
router.route("/users/verify-room").post(RoomController.checkUserRoom);
router.route("/users/info").post(RoomController.getUserInfo);
router.route("/updateRoom").post(RoomController.updateRoom);
router.route("/flushRoom").get(RoomController.flushRoom);

router.route("/meetings/create").post(MeetingController.createMeeting);
router.route("/meetings/:room_id").get(MeetingController.getRoomMeetings);

router
  .route("/notifications/:user_id/rooms/:room_id")
  .get(RoomController.getRoomNotifications);
module.exports = router;
