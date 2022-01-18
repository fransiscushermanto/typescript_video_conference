const { FirebaseAdmin } = require("../firebase/config");
const admin = new FirebaseAdmin();

async function createMeeting(
  room_id,
  meeting_name,
  offer_candidates,
  answer_candidates,
) {
  return await admin.createMeeting(
    room_id,
    meeting_name,
    offer_candidates,
    answer_candidates,
  );
}

module.exports = { createMeeting };
