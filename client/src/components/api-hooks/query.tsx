import {
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
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
  RoomMeetingModel,
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
  options: UseQueryOptions<{ rooms: RoomModel[] }, any> = {},
) {
  const [me] = useMe();
  const [rooms, setRooms] = useState<RoomModel[]>([]);
  const firebase = useFirebase();
  const [messages, setMessages] = useContext(MessageContext);
  const { refetch, ...resProps } = useQuery<{ rooms: RoomModel[] }, any>(
    "rooms",
    async () => {
      const res = await axios.get(`/${me?.user_id}/rooms`);
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

  // useEffect(() => {
  //   if (me?.user_id) {
  //     firebase.getRooms(me.user_id, {
  //       onNext: async (data) => {
  //         if (data.data()) {
  //           refetch();
  //         }
  //       },
  //     });
  //   }

  //   return () => {
  //     if (me?.user_id) {
  //       const unsub = firebase.getRooms(me.user_id, { onNext: () => {} });
  //       unsub();
  //     }
  //   };
  // }, [me]);

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

  // useEffect(() => {
  //   if (room_id) {
  //     firebase.getUserInWaitingRoom(room_id, {
  //       onNext: callAllFunctions(
  //         async (data: DocumentSnapshot<DocumentData>) => {
  //           if (data.data()) {
  //             refetch();
  //           }
  //         },
  //       ),
  //     });
  //   }

  //   return () => {
  //     if (room_id) {
  //       const unsub = firebase.getUserInWaitingRoom(room_id, {
  //         onNext: () => {},
  //       });
  //       unsub();
  //     }
  //   };
  // }, [room_id]);

  return { usersInWaitingRoom, refetch, ...resProps };
}

export function useGetRoomParticipants(
  options: UseQueryOptions<{ participants: Participant[] }, any> & {
    room_id?: string;
  } = {},
) {
  const { room_id: roomIdParam } = useParams<{ room_id }>();
  const room_id = roomIdParam || options.room_id;
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
      firebase.getRoomParticipants({
        next: async (data: QuerySnapshot<DocumentData>) => {
          console.log(data);
        },
      });
    }

    return () => {
      if (room_id) {
        const unsub = firebase.getRoomParticipants({
          next: async (data: QuerySnapshot<DocumentData>) => {
            console.log(data);
          },
        });
        unsub();
      }
    };
  }, [room_id]);
  return { participants, refetch, ...resProps };
}

export function useGetRoomMeetings(
  options: UseQueryOptions<{ room_meetings: RoomMeetingModel[] }, any> & {
    room_id?: string;
  } = {},
) {
  const firebase = useFirebase();
  const [roomMeetings, setRoomMeetings] = useState<RoomMeetingModel[]>();
  const { room_id: roomIdParam } = useParams<{ room_id }>();
  const room_id = roomIdParam || options.room_id;
  const [messages, setMessages] = useContext(MessageContext);
  const { refetch, ...resProps } = useQuery<
    { room_meetings: RoomMeetingModel[] },
    any
  >(
    "room_meetings",
    async () => {
      const res = await axios.get(`/meetings/${room_id}`);
      return res.data;
    },
    {
      ...options,
      enabled: options.enabled || false,
      onSuccess: callAllFunctions((data) => {
        setRoomMeetings(data?.room_meetings);
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
      firebase.getRoomMeetings({
        next: async (snapshot: QuerySnapshot<DocumentData>) => {
          console.log(snapshot.docChanges);
        },
      });
    }

    return () => {
      if (room_id) {
        const unsub = firebase.getRoomMeetings({
          next: async (snapshot: QuerySnapshot<DocumentData>) => {
            console.log(snapshot.docChanges);
          },
        });
        unsub();
      }
    };
  }, [room_id]);

  return { roomMeetings, refetch, ...resProps };
}
