const utils = require("../utils/Utils");

module.exports = {
  createMeeting: async (req, res, next) => {
    const { meeting_name, user_id, attendance_start_at, attendance_finish_at } =
      req.body;
    const { room_id } = req.params;

    try {
      const data = await utils.createMeeting(
        room_id,
        user_id,
        meeting_name,
        attendance_start_at,
        attendance_finish_at,
      );
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  checkMeeting: async (req, res, next) => {
    const { room_id } = req.params;
    const { meeting_id } = req.body;
    try {
      const { notFound, notStarted } = await utils.checkMeeting(
        room_id,
        meeting_id,
      );

      if (notStarted)
        return res.status(400).send({ message: "Meeting hasn't started yet" });

      if (notFound) {
        return res.status(404).send({ message: "Meeting Not Found" });
      }

      if (meeting_id && room_id && !notFound && !notStarted) {
        return res.status(200).send();
      }
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  deleteMeeting: async (req, res, next) => {
    const { room_id, meeting_id } = req.params;
    try {
      await utils.deleteMeeting(room_id, meeting_id);
      return res.status(204).send();
    } catch (error) {
      console.log("error", error);
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  getRoomMeetings: async (req, res, next) => {
    const { room_id } = req.params;
    try {
      const room_meetings = await utils.getRoomMeetings(room_id);
      return res.status(200).send({ room_meetings });
    } catch (error) {
      return res.status(404).send({ message: "Not Found", error });
    }
  },
  getMeetingRoomInfo: async (req, res, next) => {
    const { room_id, meeting_id } = req.params;
    try {
      const meeting_info = await utils.getRoomMeeting(room_id, meeting_id);

      if (meeting_info) {
        meeting_info.created_by = await utils.getUser(meeting_info.created_by);
      }

      return res.status(200).send({ meeting_info });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  getParticipantMeetingAttendance: async (req, res, next) => {
    const { room_id, meeting_id, user_id } = req.params;
    try {
      const participant_attendance =
        await utils.getParticipantMeetingAttendance(
          room_id,
          meeting_id,
          user_id,
        );
      return res.status(200).send({ participant_attendance });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  getParticipantsMeetingAttendace: async (req, res, next) => {
    const { room_id, meeting_id } = req.params;
    try {
      const participants_attendance =
        await utils.getParticipantsMeetingAttendance(room_id, meeting_id);
      return res.status(200).send({
        participants_attendance: participants_attendance.sort(
          (a, b) =>
            new Date(a.checked_in_at).valueOf() -
            new Date(b.checked_in_at).valueOf(),
        ),
      });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  storeParticipantMeetingAttendance: async (req, res, next) => {
    const { room_id, meeting_id } = req.params;
    const { user_id, preview_image } = req.body;
    try {
      await utils.storeRoomMeetingUserAttendance(
        room_id,
        meeting_id,
        user_id,
        preview_image,
      );
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  downloadRoomAttendanceToExcel: async (req, res, next) => {
    const { room_id, meeting_id } = req.params;
    try {
      const workbook = await utils.downloadRoomAttendanceToExcel(
        room_id,
        meeting_id,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      await workbook.xlsx.write(res);
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
};
