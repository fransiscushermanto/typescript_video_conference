require("dotenv").config();
const admin = require("firebase-admin");
const collections = require("./collections");

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

  /**
   *
   * @param {object} {room_id, room_host, room_password, room_name} payload
   */
  async createRoom(payload) {
    const existingRoom = await this.firestore
      .collection(collections.user_rooms)
      .doc(payload.room_host)
      .get();

    const room = await this.firestore
      .collection(collections.rooms)
      .doc(payload.room_id)
      .set(payload);

    if (!existingRoom.data()) {
      await this.firestore
        .collection(collections.user_rooms)
        .doc(payload.room_host)
        .set({ rooms: [payload.room_id] });
    } else {
      await this.firestore
        .collection(collections.user_rooms)
        .doc(payload.room_host)
        .update({
          rooms: [...existingRoom.data().rooms, payload.room_id],
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
      const id_rooms = await this.firestore
        .collection(collections.user_rooms)
        .doc(user_id)
        .get()
        .then((res) => (res.data() ? res.data().rooms : []));

      if (id_rooms.length > 0) {
        const rooms = id_rooms.map(
          async (id_room) =>
            await this.firestore
              .collection(collections.rooms)
              .doc(id_room)
              .get()
              .then((res) => res.data()),
        );
        return await Promise.all(rooms);
      }
    }

    return [];
  }
}

module.exports.FirebaseAdmin = FirebaseAdmin;
