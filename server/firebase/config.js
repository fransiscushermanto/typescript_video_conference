require("dotenv").config();
const uuid = require("uuid");
const firebaseAdmin = require("firebase-admin");
const collections = require("./collections");
const ParticipantType = require("../utils/types");
const produce = require("immer").produce;

const RoomStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
};

var config = {
  credential: firebaseAdmin.credential.cert({
    type: process.env.firebase_admin_type,
    project_id: process.env.firebase_admin_project_id,
    private_key_id: process.env.firebase_admin_private_key_id,
    private_key: process.env.firebase_admin_private_key.replace(/\\n/g, "\n"),
    client_email: process.env.firebase_admin_client_email,
    client_id: process.env.firebase_admin_client_id,
    auth_uri: process.env.firebase_admin_auth_uri,
    token_uri: process.env.firebase_admin_token_uri,
    auth_provider_x509_cert_url:
      process.env.firebase_admin_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.firebase_admin_client_x509_cert_url,
  }),
  storageBucket: process.env.BUCKET_NAME,
};

class FirebaseAdmin {
  constructor() {
    firebaseAdmin.initializeApp(config);
    this.auth = firebaseAdmin.auth();
    this.firestore = firebaseAdmin.firestore();
    this.storage = firebaseAdmin.storage();
  }

  async verifyIdToken(idToken) {
    const decodedToken = await this.auth.verifyIdToken(idToken);
    return decodedToken;
  }

  async getUser(user_id) {
    return await this.auth.getUser(user_id);
  }

  async getUserRooms(user_id) {
    const res = await this.firestore
      .collection(collections.user_rooms)
      .doc(user_id)
      .get();
    return res.data()?.rooms;
  }

  async getRoom(room_id) {
    try {
      const res = await this.firestore
        .collection(collections.rooms)
        .doc(room_id)
        .get();
      return res.data();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserNotifications(user_id) {
    const room_data = await this.firestore
      .collection(collections.notifications)
      .doc(user_id)
      .get();
    return room_data.data();
  }

  async getRoomNotifications(user_id, room_id) {
    const user_notif = await this.getUserNotifications(user_id);

    return user_notif?.rooms?.[room_id] || {};
  }

  async getRoomMeetings(room_id) {
    const res = await this.firestore
      .collection(collections.rooms)
      .doc(room_id)
      .collection(collections.room_meetings)
      .get();
    const meetings = await Promise.all(
      res.docs.map(async (meeting) => {
        const { created_by, ...resData } = meeting.data();
        return {
          meeting_id: meeting.id,
          created_by: await this.getUser(created_by),
          ...resData,
        };
      }),
    );
    return meetings;
  }

  async getRoomMeeting(room_id, meeting_id) {
    const res = await this.firestore
      .collection(collections.rooms)
      .doc(room_id)
      .collection(collections.room_meetings)
      .doc(meeting_id)
      .get();

    return res.data();
  }

  async getWaitingRoomUsers(room_id) {
    const res = await this.firestore
      .collection(collections.waiting_room)
      .doc(room_id)
      .get();
    return res.data()?.users;
  }

  async getExistWaitingRoom(room_id) {
    const res = await this.firestore
      .collection(collections.waiting_room)
      .doc(room_id)
      .get();
    return res.data();
  }

  async existRoom(room_id) {
    return !!(await this.getRoom(room_id));
  }

  /**
   *
   * @param {object} {room_id, room_host, room_password, room_name} payload
   */
  async createRoom(payload) {
    const existingUserRoom = await this.firestore
      .collection(collections.user_rooms)
      .doc(payload.room_host)
      .get();

    const room = await this.firestore
      .collection(collections.rooms)
      .doc(payload.room_id)
      .set(payload);

    await this.firestore
      .collection(collections.notifications)
      .doc(payload.room_host)
      .set({
        rooms: {
          [payload.room_id]: {
            participants: false,
            "waiting-room": false,
          },
        },
      });

    if (!existingUserRoom.data()?.rooms) {
      await this.firestore
        .collection(collections.user_rooms)
        .doc(payload.room_host)
        .set({
          rooms: [{ room_id: payload.room_id, status: RoomStatus.ACCEPTED }],
        });
    } else {
      await this.firestore
        .collection(collections.user_rooms)
        .doc(payload.room_host)
        .update({
          rooms: [
            ...existingUserRoom.data().rooms,
            { room_id: payload.room_id, status: RoomStatus.ACCEPTED },
          ],
        });
    }

    return room;
  }

  async updateRoomNotification(user_id, room_id, payload) {
    const user_notif = this.getUserNotifications(user_id);
    const room_notif = this.getRoomNotifications(user_id, room_id);
    await this.firestore
      .collection(collections.notifications)
      .doc(user_id)
      .update({
        ...user_notif,
        rooms: {
          ...user_notif.rooms,
          [room_id]: {
            ...room_notif,
            ...payload,
          },
        },
      });
  }

  /**
   *
   * @param {string} user_id
   */
  async getRooms(user_id) {
    if (user_id) {
      const user_rooms = await this.getUserRooms(user_id);

      if (user_rooms && user_rooms.length > 0) {
        const rooms = user_rooms
          .filter(({ status }) => status !== RoomStatus.DECLINED)
          .map(
            async (room) =>
              await this.firestore
                .collection(collections.rooms)
                .doc(room.room_id)
                .get()
                .then((res) => ({ ...res.data(), status: room.status })),
          );
        return await Promise.all(rooms);
      }
    }

    return [];
  }

  async getRoomParticipant(user_id, room_id) {
    const room_data = await this.getRoom(room_id);

    const participant = room_data?.room_participants?.find(
      (participant) => participant.user_id === user_id,
    );
    return participant;
  }

  async getRoomParticipants(user_id, room_id) {
    if (user_id && room_id) {
      const room_data = await this.getRoom(room_id);

      return room_data?.room_participants;
    }

    return [];
  }

  /**
   *
   * @param {string} user_id
   * @param {string} room_id
   * @returns true | false
   */
  async checkUserRoom(user_id, room_id) {
    if (user_id && room_id) {
      const user_rooms = await this.firestore
        .collection(collections.user_rooms)
        .doc(user_id)
        .get()
        .then((res) => (res.data() ? res.data().rooms : []));
      return user_rooms
        ? user_rooms
            .filter((room) => room.status === RoomStatus.ACCEPTED)
            .some((room) => room.room_id === room_id)
        : false;
    }

    return false;
  }

  async validateRoomPassword(room_id, room_password) {
    if (room_id && room_password) {
      const res = await this.getRoom(room_id);
      return String(res.room_password) === String(room_password);
    }
    return false;
  }

  async joinRoom(room_id, payload) {
    try {
      const exist_waiting_room = await this.getExistWaitingRoom(room_id);
      const user_rooms = await this.getUserRooms(payload.user_id);

      if (exist_waiting_room) {
        await this.firestore
          .collection(collections.waiting_room)
          .doc(room_id)
          .update({
            users: exist_waiting_room.users
              ? [...exist_waiting_room.users, payload.user_id]
              : [payload.user_id],
          });
      } else {
        await this.firestore
          .collection(collections.waiting_room)
          .doc(room_id)
          .set({ users: [payload.user_id] });
      }
      if (user_rooms) {
        await this.firestore
          .collection(collections.user_rooms)
          .doc(payload.user_id)
          .update({
            rooms: [...user_rooms, { room_id, status: RoomStatus.PENDING }],
          });
      } else {
        await this.firestore
          .collection(collections.user_rooms)
          .doc(payload.user_id)
          .set({
            rooms: [{ room_id, status: RoomStatus.PENDING }],
          });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }

    // await this.firestore
    //   .collection(collections.rooms)
    //   .doc(room_id)
    //   .update({
    //     room_participants: [...room_data.room_participants, payload],
    //   });
  }

  async getUsersInWaitingRoom(room_id) {
    const users = await this.getWaitingRoomUsers(room_id);
    if (users) {
      return await Promise.all(
        users
          ? users.map(async (user_id) => {
              const userInfo = await this.getUser(user_id);
              return {
                user_id,
                user_name: userInfo.displayName,
              };
            })
          : [],
      );
    }

    return [];
  }

  async acceptUserToRoom(room_id, user_id) {
    const rooms = await this.getUserRooms(user_id);
    const users = await this.getWaitingRoomUsers(room_id);
    const participants = await this.getRoomParticipants(user_id, room_id);

    return new Promise((resolve) => {
      const updatedUserRooms = produce(rooms, (draft) => {
        const target = draft.find((room) => room.room_id === room_id);
        const index = draft.indexOf(target);
        draft[index].status = RoomStatus.ACCEPTED;
      });

      const updatedUsersInWaitingRoom = users.filter(
        (user) => user !== user_id,
      );

      this.firestore.collection(collections.user_rooms).doc(user_id).update({
        rooms: updatedUserRooms,
      });

      this.firestore.collection(collections.waiting_room).doc(room_id).update({
        users: updatedUsersInWaitingRoom,
      });

      this.firestore
        .collection(collections.rooms)
        .doc(room_id)
        .update({
          room_participants: [
            ...participants,
            {
              role: ParticipantType.PARTICIPANT,
              user_id,
            },
          ],
        });
      resolve(true);
    });
  }

  async rejectUserToRoom(room_id, user_id) {
    return new Promise(async (resolve) => {
      const userRooms = await this.getUserRooms(user_id);
      const waitingUsers = await this.getWaitingRoomUsers(room_id);

      this.firestore
        .collection(collections.waiting_room)
        .doc(room_id)
        .update({
          users: waitingUsers.filter(
            (waitingUserId) => waitingUserId !== user_id,
          ),
        });
      this.firestore
        .collection(collections.user_rooms)
        .doc(user_id)
        .update({
          rooms: userRooms.filter((room) => room.room_id !== room_id),
        });
      resolve(true);
    });
  }

  async deleteRoom(room_id, user_id) {
    return new Promise(async (resolve) => {
      const user = await this.getRoomParticipant(user_id, room_id);
      if (user && user.role === ParticipantType.HOST) {
        let participantIndex = 0,
          waitingParticipantIndex = 0;
        let participants = await this.getRoomParticipants(user_id, room_id);
        participants = participants.filter(
          (participant) => participant.user_id !== user_id,
        );
        let waitingParticipants = await this.getUsersInWaitingRoom(room_id);
        for (var participant of participants) {
          const prevRooms = await this.getUserRooms(participant.user_id);
          await this.firestore
            .collection(collections.user_rooms)
            .doc(participant.user_id)
            .update({
              rooms: prevRooms.filter((room) => room.room_id !== room_id),
            });
          participantIndex += 1;
        }

        for (var waitingParticipant of waitingParticipants) {
          const prevRooms = await this.getUserRooms(waitingParticipant.user_id);
          await this.firestore
            .collection(collections.user_rooms)
            .doc(waitingParticipant.user_id)
            .update({
              rooms: prevRooms.filter((room) => room.room_id !== room_id),
            });
          waitingParticipantIndex += 1;
        }

        if (
          participantIndex === participants.length &&
          waitingParticipantIndex === waitingParticipants.length
        ) {
          const prevRooms = await this.getUserRooms(user_id);
          await this.firestore
            .collection(collections.room_meetings)
            .doc(room_id)
            .delete();
          await this.firestore
            .collection(collections.user_rooms)
            .doc(user_id)
            .update({
              rooms: prevRooms.filter((room) => room.room_id !== room_id),
            });
          await this.firestore
            .collection(collections.waiting_room)
            .doc(room_id)
            .delete();

          await this.firestore
            .collection(collections.rooms)
            .doc(room_id)
            .delete();
        }
      } else {
        let userRoom = await this.getUserRooms(user_id);
        userRoom = userRoom.find((room) => room.room_id === room_id);
        if (userRoom && userRoom.status === RoomStatus.PENDING) {
          const waitingParticipant = await this.getUsersInWaitingRoom(room_id);
          this.firestore
            .collection(collections.waiting_room)
            .doc(room_id)
            .update({
              users: waitingParticipant
                .filter((participant) => participant.user_id !== user_id)
                .map((participant) => participant.user_id),
            });
        } else {
          const participants = await this.getRoomParticipants(user_id, room_id);
          this.firestore
            .collection(collections.rooms)
            .doc(room_id)
            .update({
              room_participants: participants.filter(
                (participant) => participant.user_id !== user_id,
              ),
            });
        }

        const prevRooms = await this.getUserRooms(user_id);
        await this.firestore
          .collection(collections.user_rooms)
          .doc(user_id)
          .update({
            rooms: prevRooms.filter((room) => room.room_id !== room_id),
          });
      }

      resolve(true);
    });
  }

  async createMeeting(
    room_id,
    user_id,
    meeting_name,
    attendance_start_at,
    attendance_finish_at,
  ) {
    try {
      let data;
      const meetingID = uuid.v4();
      await new Promise(async (resolve) => {
        const roomMeetingsDoc = this.firestore
          .collection(collections.rooms)
          .doc(room_id)
          .collection(collections.room_meetings);
        const created_at = new Date().toString();
        const created_by = user_id;
        data = {
          created_by,
          meeting_name,
          created_at,
          attendance_start_at,
          attendance_finish_at,
        };

        roomMeetingsDoc.doc(meetingID).set(data);

        resolve(true);
      });
      data.meeting_id = meetingID;
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteMeeting(room_id, meeting_id) {
    await this.firestore
      .collection(collections.rooms)
      .doc(room_id)
      .collection(collections.room_meetings)
      .doc(meeting_id)
      .delete();
  }

  async checkMeeting(room_id, meeting_id) {
    try {
      const meeting = await this.getRoomMeeting(room_id, meeting_id);

      if (!meeting) {
        return {
          notFound: true,
          notStarted: false,
        };
      }

      const now = new Date();
      const startTime = new Date(meeting.attendance_start_at);

      return {
        notFound: !meeting,
        notStarted: now < startTime,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getRoomUserFaces(room_id, user_id) {
    try {
      const user_faces = await this.firestore
        .collection(collections.rooms)
        .doc(room_id)
        .collection(collections.room_participants_faces)
        .doc(user_id)
        .get();

      return user_faces.data()?.faces;
    } catch (error) {
      throw error;
    }
  }

  async getRoomFaces(room_id) {
    try {
      const room_faces = await this.firestore
        .collection(collections.rooms)
        .doc(room_id)
        .collection(collections.room_participants_faces)
        .get();

      return room_faces.docs
        .map((doc) => {
          const faces = doc.data()?.faces;

          if (!faces) return undefined;

          const formatedPayload = Object.entries(faces).map(
            ([face_id, payload]) => ({
              face_id,
              ...payload,
            }),
          );

          return {
            faces: formatedPayload,
            user_id: doc.id,
          };
        })
        .filter((e) => e);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async storeRoomUserFace(room_id, user_id, face_description, preview_image) {
    try {
      const prevUserFaces = await this.getRoomUserFaces(room_id, user_id);
      const faceId = uuid.v4();
      const payload = {
        face_description,
        preview_image,
        created_at: new Date().toString(),
      };

      const docFaces = await this.firestore
        .collection(collections.rooms)
        .doc(room_id)
        .collection(collections.room_participants_faces)
        .doc(user_id);
      if (prevUserFaces) {
        docFaces.update({
          faces: { ...prevUserFaces, [faceId]: payload },
        });
      } else {
        docFaces.set({
          faces: { [faceId]: payload },
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async getParticipantsMeetingAttendance(room_id, meeting_id) {
    try {
      const res = await this.firestore
        .collection(collections.rooms)
        .doc(room_id)
        .collection(collections.room_meetings)
        .doc(meeting_id)
        .collection(collections.room_meeting_attendances)
        .get();

      return Promise.all(
        res.docs.map(async (doc) => {
          const user_info = await this.getUser(doc.id);

          return {
            ...doc.data(),
            user_info,
          };
        }),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getParticipantMeetingAttendance(room_id, meeting_id, user_id) {
    try {
      const attendances = await this.getParticipantsMeetingAttendance(
        room_id,
        meeting_id,
      );
      return attendances.find(
        (attendance) => attendance.user_info.uid === user_id,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async storeRoomMeetingUserAttendance(
    room_id,
    meeting_id,
    user_id,
    preview_image,
  ) {
    try {
      const checked_in_at = new Date().toString();

      await this.firestore
        .collection(collections.rooms)
        .doc(room_id)
        .collection(collections.room_meetings)
        .doc(meeting_id)
        .collection(collections.room_meeting_attendances)
        .doc(user_id)
        .set({
          preview_image,
          checked_in_at,
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getImageFromStorage(path) {}
}

const admin = new FirebaseAdmin();

module.exports = { admin };
