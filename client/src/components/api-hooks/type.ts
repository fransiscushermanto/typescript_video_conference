import { User } from "firebase/auth";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { IFirestoreOnSnapshotArguments } from "../../firebase/config";

export enum RoomStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export enum ParticipantType {
  HOST = "host",
  CO_HOST = "co-host",
  PARTICIPANT = "participant",
}

export interface UserModel {
  user_id?: string;
  user_name?: string;
  socket_id?: string;
  peer_id?: string;
}

export interface RoomModel {
  room_host: string;
  room_id: string;
  room_name: string;
  room_password: string;
  status: RoomStatus;
}

export interface QueryOptions
  extends Omit<IFirestoreOnSnapshotArguments, "onNext"> {
  onNext?: (snapshot: DocumentSnapshot<DocumentData>) => void;
}

export interface UserInfoModel
  extends Omit<UserModel, "socket_id" | "peer_id"> {}

export interface UserInWaitingRoomModel extends UserInfoModel {
  status: ParticipantType;
}

export interface PeerOfferModel {
  type: RTCSdpType;
  sdp: string;
}

export interface RoomMeetingModel {
  meeting_id: string;
  offer: PeerOfferModel;
  meeting_name: string;
  created_by: User;
  created_at: Date;
}

export interface RoomParticipantFaceModel {
  face_id: string;
  preview_image: string;
  face_description: string;
  created_at: Date;
}

export interface RoomFacesModel {
  faces: RoomParticipantFaceModel[];
  user_id: string;
}

export interface RoomNotificationModel {
  "waiting-room": boolean;
  participants: boolean;
}

export type RCTOfferStatus = "exist" | "create";
