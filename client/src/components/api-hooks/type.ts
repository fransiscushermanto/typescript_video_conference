import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { IFirestoreOnSnapshotArguments } from "../../firebase/config";
import { UserModel } from "../Providers/RoomProvider";

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
  offer: PeerOfferModel;
  meeting_name: string;
}

export interface RoomNotificationModel {
  "waiting-room": boolean;
  participants: boolean;
}
