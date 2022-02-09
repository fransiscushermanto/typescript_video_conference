const utils = require("../utils/Utils");

module.exports = {
  createMeeting: async (req, res, next) => {
    const { room_id, meeting_name, user_id } = req.body;

    try {
      const meeting_id = await utils.createMeeting(
        room_id,
        user_id,
        meeting_name,
      );
      return res.status(200).send({ meeting_id });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error", error });
    }
  },
  checkMeeting: async (req, res, next) => {
    const { room_id } = req.params;
    const { meeting_id } = req.body;
    try {
      if (
        meeting_id &&
        room_id &&
        (await utils.checkMeeting(room_id, meeting_id))
      ) {
        return res.status(200).send();
      }
      return res.status(404).send({ message: "Meeting Not Found" });
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
};
