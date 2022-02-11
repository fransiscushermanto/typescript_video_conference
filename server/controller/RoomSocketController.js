require("fs");
const participants = {};
const socketToRoom = {};

module.exports = function (socket, ionsp) {
  socket.on("JOIN_MEETING_ROOM", ({ meeting_id, me }) => {
    const meetingParticipants = participants[meeting_id];

    if (meetingParticipants && meetingParticipants?.length > 0) {
      const existParticipant = meetingParticipants.find(
        (participant) => participant.user_id === me.user_id,
      );
      if (existParticipant) {
        const index = meetingParticipants.indexOf(existParticipant);
        meetingParticipants[index] = {
          ...meetingParticipants[index],
          socket_id: socket.id,
        };
      } else {
        meetingParticipants.push({ ...me, socket_id: socket.id });
      }
    } else {
      participants[meeting_id] = [{ ...me, socket_id: socket.id }];
    }

    const participantInThisMeetingRoom = meetingParticipants?.filter(
      (participant) => participant.user_id !== me.user_id,
    );

    socketToRoom[socket.id] = meeting_id;
    socket.join(meeting_id);

    socket
      .to(meeting_id)
      .emit("NEW_PARTICIPANT", { message: `${me.user_name} is joining` });

    ionsp
      .to(socket.id)
      .emit("ALL_PARTICIPANTS", { participants: participantInThisMeetingRoom });
  });

  socket.on("RTC_OFFER", ({ offerReceiveID, ...resData }) => {
    const meeting_id = socketToRoom[socket.id];
    const receiver_socket_id =
      participants[meeting_id]?.find(
        (participant) => participant.user_id === offerReceiveID,
      )?.socket_id || "";
    ionsp
      .to(receiver_socket_id)
      .emit("RTC_GET_OFFER", { ...resData, socket_id: socket.id });
  });

  socket.on("RTC_ANSWER", ({ answerReceiveID, ...resData }) => {
    const meeting_id = socketToRoom[socket.id];
    const receiver_socket_id =
      participants[meeting_id]?.find(
        (participant) => participant.user_id === answerReceiveID,
      )?.socket_id || "";

    ionsp
      .to(receiver_socket_id)
      .emit("RTC_GET_ANSWER", { ...resData, socket_id: socket.id });
  });

  socket.on("RTC_CANDIDATE", ({ candidateReceiveID, ...resData }) => {
    const meeting_id = socketToRoom[socket.id];
    const receiver_socket_id =
      participants[meeting_id]?.find(
        (participant) => participant.user_id === candidateReceiveID,
      )?.socket_id || "";

    ionsp.to(receiver_socket_id).emit("RTC_GET_CANDIDATE", {
      ...resData,
      socket_id: socket.id,
    });
  });

  socket.on("LOCAL_STREAM_UPDATE", () => {
    const meeting_id = socketToRoom[socket.id];
    const meeting = participants[meeting_id];
    const currentParticipant = meeting.find(
      (participant) => participant.socket_id === socket.id,
    );
    // socket.to(meeting_id).emit("UPDATE_REMOTE_STREAM", {
    //   participant: currentParticipant,
    //   stream,
    // });
    const participantInThisMeetingRoom = meeting?.filter(
      (participant) => participant.socket_id !== socket.id,
    );
    socket.emit("UPDATE_REMOTE_STREAM", {
      participants: participantInThisMeetingRoom,
    });
  });

  socket.on(
    "RTC_OFFER_NEGOTIATION",
    ({ receiverNegotiationID, ...resData }) => {
      const meeting_id = socketToRoom[socket.id];
      const receiver_socket_id =
        participants[meeting_id]?.find(
          (participant) => participant.user_id === receiverNegotiationID,
        )?.socket_id || "";
      ionsp.to(receiver_socket_id).emit("RTC_GET_OFFER_NEGOTIATION", resData);
    },
  );

  socket.on("RTC_ANSWER_NEGOTIATION", ({ answerNegotiationID, ...resData }) => {
    const meeting_id = socketToRoom[socket.id];
    const receiver_socket_id =
      participants[meeting_id]?.find(
        (participant) => participant.user_id === answerNegotiationID,
      )?.socket_id || "";
    ionsp.to(receiver_socket_id).emit("RTC_GET_ANSWER_NEGOTIATION", resData);
  });

  socket.on("disconnect", () => {
    const meeting_id = socketToRoom[socket.id];
    const user_id =
      participants[meeting_id]?.find(
        (participant) => participant.socket_id === socket.id,
      )?.user_id || "";
    let meeting = participants[meeting_id];
    if (meeting) {
      meeting = meeting.filter(
        (participant) => participant.socket_id !== socket.id,
      );
      participants[meeting_id] = meeting;
      if (meeting.length === 0) {
        delete participants[meeting_id];
        return;
      }
    }
    socket.to(meeting_id).emit("PARTICIPANT_LEAVE", { user_id });
  });
};
