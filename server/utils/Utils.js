require("fs");
const { admin } = require("../firebase/config");

const ParticipantType = require("./types");
const socket = require("../../index").io;
const helper = require("./helper");
const excelJS = require("exceljs");
const { HOST } = require("./types");

const user_sockets = {};
const rooms = {};

/**
 *
 * @param {string} user_id
 * @returns {object} user
 */
const getUser = async (user_id) => {
  return await admin.getUser(user_id);
};

const existRoom = async (room_id) => {
  return await admin.existRoom(room_id);
};

/**
 * @param {Object} {room_host, room_name}
 */
const createRoom = async ({ room_host, room_name }) => {
  let newRoom, room_id, room_password;

  do {
    room_id = helper.generate(10);
    room_password = helper.generate(10);
  } while (await existRoom(room_id));

  newRoom = {
    room_id,
    room_host,
    room_password,
    room_name,
    room_participants: [
      {
        user_id: room_host,
        role: ParticipantType.HOST,
      },
    ],
  };
  return await admin.createRoom(newRoom);
};

const validateJoiningRoom = async (user_id, room_id, room_password) => {
  try {
    if (await admin.validateRoomPassword(room_id, room_password)) {
      const user_rooms = await admin.getUserRooms(user_id);

      if (!user_rooms?.some((room) => room.room_id === room_id)) {
        await admin.joinRoom(room_id, {
          user_id,
          status: ParticipantType.PARTICIPANT,
        });
      }

      const room = await admin.getRoom(room_id);

      const host_user_id = rooms[room_id]?.find(
        (participant) => participant.role === HOST,
      )?.user_id;

      if (host_user_id) {
        socket
          .to(user_sockets[host_user_id])
          .emit("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", { type: "add", room });
      }
      return true;
    }

    return false;
  } catch (error) {
    console.log(error);
  }
};

const getRoom = async (room_id) => {
  return await admin.getRoom(room_id);
};

/**
 *
 * @param {string} user_id
 * @returns {Array} rooms
 */
const getRooms = async (user_id) => {
  return await admin.getRooms(user_id);
};

const getRoomNotifications = async (user_id, room_id) => {
  return await admin.getRoomNotifications(user_id, room_id);
};

/**
 *
 * @param {string} user_id
 * @param {string} room_id
 * @returns true | false
 */
const checkUserRoom = async (user_id, room_id) => {
  return await admin.checkUserRoom(user_id, room_id);
};

const getRoomParticipants = async (user_id, room_id) => {
  const room_participants = await admin.getRoomParticipants(user_id, room_id);

  const participants = room_participants?.map(async (participant) => {
    const userData = await admin.getUser(participant.user_id);
    return {
      ...participant,
      user_name: userData.displayName,
      user_email: userData.email,
    };
  });

  return await Promise.all(participants);
};

/**
 *
 * @param {string} room_id
 * @returns {User[]}
 */
const getUsersInWaitingRoom = async (room_id) => {
  return await admin.getUsersInWaitingRoom(room_id);
};

const updateUsersInWaitingRoom = async (room_id, user_id, action) => {
  switch (action) {
    case "accept":
      await admin.acceptUserToRoom(room_id, user_id);
      break;

    case "reject":
      await admin.rejectUserToRoom(room_id, user_id);
      break;
  }
  socket.to(user_sockets[user_id]).emit("UPDATE_USER_ROOMS", {
    type: action === "reject" ? "delete" : "update",
    debug: user_sockets,
  });

  const host_user_id = rooms[room_id].find(
    (participant) => participant.role === HOST,
  ).user_id;

  socket
    .to(user_sockets[host_user_id])
    .emit("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", {
      type: action === "reject" ? "delete" : "update",
    });
  return;
};

async function deleteRoom(room_id, user_id) {
  try {
    const room = await admin.getRoom(room_id);
    const res = await admin.deleteRoom(room_id, user_id);
    if (rooms[room_id]) {
      const host_user_id = rooms[room_id]?.find(
        (participant) => participant.role === HOST,
      )?.user_id;
      console.log("deleteRoom", user_sockets, host_user_id);
      socket
        .to(user_sockets[host_user_id])
        .emit("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", { type: "delete", room });
    }
    socket.emit("UPDATE_USER_ROOMS", { type: "delete" });
    if (socket.sockets.adapter.rooms[room_id]) {
      socket.leave(room_id);
    }
    return res;
  } catch (error) {
    console.log("error", error);
  }
}

async function createMeeting(
  room_id,
  user_id,
  meeting_name,
  attendance_start_at,
  attendance_finish_at,
) {
  return await admin.createMeeting(
    room_id,
    user_id,
    meeting_name,
    attendance_start_at,
    attendance_finish_at,
  );
}

async function deleteMeeting(room_id, meeting_id) {
  return await admin.deleteMeeting(room_id, meeting_id);
}

async function getRoomMeeting(room_id, meeting_id) {
  return await admin.getRoomMeeting(room_id, meeting_id);
}

async function getRoomMeetings(room_id) {
  return await admin.getRoomMeetings(room_id);
}

async function checkMeeting(room_id, meeting_id) {
  return await admin.checkMeeting(room_id, meeting_id);
}

async function storeRoomUserFace(
  room_id,
  user_id,
  face_description,
  preview_image,
) {
  await admin.storeRoomUserFace(
    room_id,
    user_id,
    face_description,
    preview_image,
  );

  return socket.to(room_id).emit("GET_SAVED_IMAGE");
}

async function getRoomUserFaces(room_id, user_id) {
  try {
    const faces = await admin.getRoomUserFaces(room_id, user_id);
    return faces
      ? Object.entries(faces).map(([face_id, payload]) => ({
          face_id,
          ...payload,
          created_at: payload.created_at?.toDate?.(),
        }))
      : undefined;
  } catch (error) {
    throw error;
  }
}

async function getRoomFaces(room_id) {
  try {
    const room_faces = await admin.getRoomFaces(room_id);

    return room_faces;
  } catch (error) {
    throw error;
  }
}

async function storeRoomMeetingUserAttendance(
  room_id,
  meeting_id,
  user_id,
  preview_image,
) {
  return await admin.storeRoomMeetingUserAttendance(
    room_id,
    meeting_id,
    user_id,
    preview_image,
  );
}

async function getParticipantsMeetingAttendance(room_id, meeting_id) {
  return await admin.getParticipantsMeetingAttendance(room_id, meeting_id);
}

async function getParticipantMeetingAttendance(room_id, meeting_id, user_id) {
  return await admin.getParticipantMeetingAttendance(
    room_id,
    meeting_id,
    user_id,
  );
}

async function downloadRoomAttendanceToExcel(room_id, meeting_id) {
  try {
    let meeting_attendance = await admin.getParticipantsMeetingAttendance(
      room_id,
      meeting_id,
    );

    const workbook = new excelJS.Workbook();

    const worksheet = workbook.addWorksheet("Attendance");
    worksheet.columns = [
      {
        header: "No",
        key: "no",
        width: 10,
      },
      {
        header: "Email",
        key: "user_email",
        width: 60,
      },
      {
        header: "Name",
        key: "user_name",
        width: 60,
      },
      {
        header: "Check-in Time",
        key: "checked_in_at",
        width: 60,
      },
      {
        header: "Preview Image",
        key: "preview_image",
        width: 100,
      },
    ];

    meeting_attendance = await Promise.all(
      meeting_attendance.map(async (attendance, i) => {
        attendance.no = i + 1;
        attendance.user_name = attendance.user_info.displayName;
        attendance.user_email = attendance.user_info.email;
        delete attendance.user_info;
        return attendance;
      }),
    );

    meeting_attendance.forEach((attendance) => {
      worksheet.addRow(attendance);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.columns[0].alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getRows(2, worksheet.columns[4].values.length).forEach((row) => {
      const targetCell = row.getCell(5);

      if (targetCell.value) {
        targetCell.value = {
          text: targetCell.value,
          hyperlink: targetCell.value,
          tooltip: targetCell.value,
        };
      }
    });

    for (let i = 0; i < worksheet.columns.length; i++) {
      let maxWidth = 0;

      const column = worksheet.columns[i];
      for (let j = 1; j < column.values.length; j++) {
        let columnLength;
        const columnValue = column.values[j];
        if (typeof columnValue === "string") {
          columnLength = columnValue.length;
        } else if (typeof columnValue === "object") {
          columnLength = columnValue.text.length;
        }

        if (columnLength > maxWidth) {
          maxWidth = columnLength;
        }
      }

      column.width = maxWidth < 10 ? 10 : maxWidth;
    }

    return workbook;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getUser,
  createRoom,
  validateJoiningRoom,
  existRoom,
  getRoom,
  getRooms,
  checkUserRoom,
  getRoomParticipants,
  getUsersInWaitingRoom,
  updateUsersInWaitingRoom,
  deleteRoom,
  createMeeting,
  deleteMeeting,
  getRoomMeeting,
  getRoomMeetings,
  getRoomNotifications,
  user_sockets,
  rooms,
  checkMeeting,
  storeRoomUserFace,
  getRoomUserFaces,
  getRoomFaces,
  storeRoomMeetingUserAttendance,
  getParticipantMeetingAttendance,
  getParticipantsMeetingAttendance,
  downloadRoomAttendanceToExcel,
};
