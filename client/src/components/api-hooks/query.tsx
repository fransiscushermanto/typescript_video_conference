import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useQuery, UseQueryOptions } from "react-query";
import { useParams } from "react-router-dom";
import axios from "../../axios-instance";
import { useFirebase, useMe } from "../../hooks";
import { Severities } from "../CustomSnackbar";
import { callAllFunctions } from "../helper";
import { MessageContext } from "../Providers/MessageProvider";
import {
  ParticipantType,
  QueryOptions,
  RoomModel,
  RoomStatus,
  UserInfoModel,
  UserInWaitingRoomModel,
} from "./type";

interface Participant {
  user_id: string;
  role: ParticipantType;
  user_name: string;
}

export function useGetRooms(
  user_id: string,
  options: UseQueryOptions<{ rooms: RoomModel[] }, any> = {},
) {
  const [rooms, setRooms] = useState<RoomModel[]>([]);
  const firebase = useFirebase();
  const [messages, setMessages] = useContext(MessageContext);
  const { refetch, ...resProps } = useQuery<{ rooms: RoomModel[] }, any>(
    "rooms",
    async () => {
      const res = await axios.get(`/rooms/${user_id}`);
      return res.data;
    },
    {
      ...options,
      enabled: options.enabled || false,
      onSuccess: callAllFunctions((data) => {
        setRooms(data?.rooms);
      }, options.onSuccess),
      onError: callAllFunctions(({ message }) => {
        setMessages([
          ...messages,
          {
            id: Date.now(),
            message: message,
            severity: Severities.ERROR,
          },
        ]);
      }, options.onError),
    },
  );

  useEffect(() => {
    if (user_id) {
      firebase.getRooms(user_id, {
        onNext: async (data) => {
          if (data.data()) {
            refetch();
          }
        },
      });
    }

    return () => {
      if (user_id) {
        const unsub = firebase.getRooms(user_id, { onNext: () => {} });
        unsub();
      }
    };
  }, [user_id]);

  return { rooms, refetch, ...resProps };
}

export function useGetUsersInWaitingRoom(
  room_id: string,
  options: UseQueryOptions<{ users: UserInWaitingRoomModel[] }, any> = {},
) {
  const [usersInWaitingRoom, setUsersInWaitingRoom] = useState<
    UserInWaitingRoomModel[]
  >([]);
  const firebase = useFirebase();
  const [messages, setMessages] = useContext(MessageContext);

  const { refetch, ...resProps } = useQuery<
    { users: UserInWaitingRoomModel[] },
    any
  >(
    "waiting-users",
    async () => {
      const res = await axios.get(`/rooms/${room_id}/participants/waiting`);
      return res.data;
    },
    {
      ...options,
      enabled: options.enabled || false,
      onSuccess: callAllFunctions((data) => {
        setUsersInWaitingRoom(data?.users);
      }, options.onSuccess),
      onError: callAllFunctions(({ message }) => {
        setMessages([
          ...messages,
          {
            id: Date.now(),
            message: message,
            severity: Severities.ERROR,
          },
        ]);
      }, options.onError),
    },
  );

  useEffect(() => {
    if (room_id) {
      firebase.getUserInWaitingRoom(room_id, {
        onNext: callAllFunctions(
          async (data: DocumentSnapshot<DocumentData>) => {
            if (data.data()) {
              refetch();
            }
          },
        ),
      });
    }

    return () => {
      if (room_id) {
        const unsub = firebase.getUserInWaitingRoom(room_id, {
          onNext: () => {},
        });
        unsub();
      }
    };
  }, [room_id]);

  return { usersInWaitingRoom, refetch, ...resProps };
}

export function useGetRoomParticipants(
  options: UseQueryOptions<{ participants: Participant[] }, any> = {},
) {
  const { room_id } = useParams<{ room_id }>();
  const [me] = useMe();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useContext(MessageContext);
  const firebase = useFirebase();
  const { refetch, ...resProps } = useQuery<
    { participants: Participant[] },
    any
  >(
    "room-participants",
    async () => {
      const res = await axios.get(`/rooms/${room_id}/participants`, {
        params: {
          user_id: me.user_id,
        },
      });
      return res.data;
    },
    {
      ...options,
      enabled: options.enabled || false,
      onSuccess: callAllFunctions((data) => {
        setParticipants(data?.participants);
      }, options.onSuccess),
      onError: callAllFunctions(({ message }) => {
        setMessages([
          ...messages,
          {
            id: Date.now(),
            message: message,
            severity: Severities.ERROR,
          },
        ]);
      }, options.onError),
    },
  );

  useEffect(() => {
    if (room_id) {
      firebase.getRoomParticipants(room_id, {
        onNext: callAllFunctions(
          async (data: DocumentSnapshot<DocumentData>) => {
            if (data.data()) {
              refetch();
            }
          },
        ),
      });
    }

    return () => {
      if (room_id) {
        const unsub = firebase.getRoomParticipants(room_id, {
          onNext: () => {},
        });
        unsub();
      }
    };
  }, [room_id]);
  return { participants, refetch, ...resProps };
}
