require("express");
const router = require("express-promise-router")();
const RoomController = require("../controller/RoomController");
const MeetingController = require("../controller/MeetingController");

router.route("/rooms/create").post(RoomController.createRoom);
router.route("/rooms/join").post(RoomController.joinRoom);
router.route("/rooms/verify").post(RoomController.checkRoom);
router.route("/rooms/:room_id").delete(RoomController.deleteRoom);
router
  .route("/rooms/:room_id/participants")
  .get(RoomController.getRoomParticipants);
router
  .route("/rooms/:room_id/participants/waiting")
  .get(RoomController.getUsersInWaitingRoom);
router.route("/rooms/:room_id/faces").get(RoomController.getRoomFaces);
router
  .route("/rooms/:room_id/faces/:user_id")
  .get(RoomController.getRoomUserFaces);
router
  .route("/rooms/:room_id/faces/:user_id")
  .post(RoomController.storeUserFace);
router
  .route("/rooms/:room_id/meetings/verify")
  .post(MeetingController.checkMeeting);
router
  .route("/rooms/:room_id/participants/waiting/:user_id")
  .post(RoomController.updateParticipantsInWaitingRoom);
router.route("/:user_id/rooms").get(RoomController.getRooms);
router.route("/users/verify-room").post(RoomController.checkUserRoom);
router.route("/users/info").post(RoomController.getUserInfo);

router.route("/meetings/:room_id").get(MeetingController.getRoomMeetings);
router.route("/meetings/:room_id/create").post(MeetingController.createMeeting);
router
  .route("/meetings/:room_id/:meeting_id")
  .get(MeetingController.getMeetingRoomInfo);
router
  .route("/meetings/:room_id/:meeting_id")
  .delete(MeetingController.deleteMeeting);
router
  .route("/meetings/:room_id/:meeting_id/attendances")
  .post(MeetingController.storeParticipantMeetingAttendance);
router
  .route("/meetings/:room_id/:meeting_id/attendances")
  .get(MeetingController.getParticipantsMeetingAttendace);
router
  .route("/meetings/:room_id/:meeting_id/attendances/download")
  .get(MeetingController.downloadRoomAttendanceToExcel);
router
  .route("/meetings/:room_id/:meeting_id/attendances/:user_id")
  .get(MeetingController.getParticipantMeetingAttendance);

router
  .route("/notifications/:user_id/rooms/:room_id")
  .get(RoomController.getRoomNotifications);
module.exports = router;
