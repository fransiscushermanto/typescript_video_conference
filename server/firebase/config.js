require("dotenv").config();
const admin = require("firebase-admin");
const collections = require("./collections");

const RoomStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
};

var config = {
  credential: admin.credential.cert({
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
};

class FirebaseAdmin {
  constructor() {
    admin.initializeApp(config);
    this.auth = admin.auth();
    this.firestore = admin.firestore();
    this.storage = admin.storage();
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
    return res.data();
  }

  async getRoom(room_id) {
    const res = await this.firestore
      .collection(collections.rooms)
      .doc(room_id)
      .get();
    return res.data();
  }

  async getExistWaitingRoom(room_id) {
    const res = await this.firestore
      .collection(collections.waiting_room)
      .doc(room_id)
      .get();
    return res.data();
  }

  async checkRoom(room_id) {
    return !!(await this.getRoom(room_id));
  }

  async getUsersInWaitingRoom(room_id) {
    const res = await this.firestore
      .collection(collections.waiting_room)
      .doc(room_id)
      .get();
    if (res.data()) {
      const users = res.data().users;

      return await Promise.all(
        users.map(async ({ user_id, status }) => {
          const userInfo = await this.getUser(user_id);
          return {
            user_id,
            status,
            user_name: userInfo.displayName,
          };
        }),
      );
    }

    return [];
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

  /**
   *
   * @param {string} user_id
   */
  async getRooms(user_id) {
    if (user_id) {
      const user_rooms = await this.firestore
        .collection(collections.user_rooms)
        .doc(user_id)
        .get()
        .then((res) => {
          return res.data() ? res.data().rooms : [];
        });
      if (user_rooms.length > 0) {
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

  async getRoomParticipants(user_id, room_id) {
    if (user_id && room_id) {
      const room_data = await this.getRoom(room_id);

      const participants = room_data.room_participants.map(
        async (participant) => {
          const user_data = await this.getUser(participant.user_id);
          return {
            ...participant,
            user_name: user_data.displayName,
          };
        },
      );

      return await Promise.all(participants);
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
      return user_rooms.some((room) => room.room_id === room_id);
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
      const room_data = await this.getRoom(room_id);

      const exist_waiting_room = await this.getExistWaitingRoom(room_id);
      const user_rooms = await this.getUserRooms(payload.user_id);

      console.log("exist_waiting_room", exist_waiting_room);
      if (exist_waiting_room) {
        await this.firestore
          .collection(collections.waiting_room)
          .doc(room_id)
          .update({
            users: exist_waiting_room.users
              ? [...exist_waiting_room.users, payload]
              : [payload],
          });
      } else {
        await this.firestore
          .collection(collections.waiting_room)
          .doc(room_id)
          .set({ users: [payload] });
      }

      if (user_rooms) {
        await this.firestore
          .collection(collections.user_rooms)
          .doc(payload.user_id)
          .update({
            rooms: [
              ...user_rooms.rooms,
              { room_id, status: RoomStatus.PENDING },
            ],
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
    }

    // await this.firestore
    //   .collection(collections.rooms)
    //   .doc(room_id)
    //   .update({
    //     room_participants: [...room_data.room_participants, payload],
    //   });
  }
}

module.exports.FirebaseAdmin = FirebaseAdmin;
