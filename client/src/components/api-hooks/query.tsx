import { DocumentData, QuerySnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useQuery, UseQueryOptions } from "react-query";
import { useParams } from "react-router-dom";
import axios from "../../axios-instance";
import { useFirebase, useMe, useSocket } from "../../hooks";
import { Severities } from "../CustomSnackbar";
import { callAllFunctions } from "../helper";
import { MessageContext } from "../Providers/MessageProvider";
import {
  ParticipantType,
  RoomMeetingModel,
  RoomModel,
  RoomNotificationModel,
  UserInWaitingRoomModel,
  RoomParticipantFaceModel,
  RoomFacesModel,
} from "./type";

interface Participant {
  user_id: string;
  role: ParticipantType;
  user_name: string;
}

export function useGetRooms(
  options: UseQueryOptions<{ rooms: RoomModel[] }, any> = {},
) {
  const socket = useSocket();
  const [me] = useMe();
  const { refetch, data, ...resProps } = useQuery<{ rooms: RoomModel[] }, any>(
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
  const [rooms, setRooms] = useState<RoomModel[]>(data?.rooms || []);
  const [messages, setMessages] = useContext(MessageContext);

  useEffect(() => {
    rooms?.forEach(({ room_id }) => {
      socket?.emit("JOIN_ROOM", { room_id, me });
    });
  }, [rooms, me]);

  useEffect(() => {
    socket?.on("UPDATE_USER_ROOMS", refetch);

    return () => {
      socket?.off("UPDATE_USER_ROOMS", () => {});
    };
  }, []);

  return { rooms, refetch, ...resProps };
}

export function useGetUsersInWaitingRoom(
  room_id: string,
  options: UseQueryOptions<{ users: UserInWaitingRoomModel[] }, any> = {},
) {
  const socket = useSocket();
  const { refetch, data, ...resProps } = useQuery<
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

  const [usersInWaitingRoom, setUsersInWaitingRoom] = useState<
    UserInWaitingRoomModel[]
  >(data?.users || []);
  const [messages, setMessages] = useContext(MessageContext);

  useEffect(() => {
    socket?.on("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", refetch);

    return () => {
      socket?.off("UPDATE_PARTICIPANTS_IN_WAITING_ROOM", () => {});
    };
  }, []);

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

  const { refetch, data, ...resProps } = useQuery<
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
  const [participants, setParticipants] = useState<Participant[]>(
    data?.participants || [],
  );
  const [messages, setMessages] = useContext(MessageContext);
  const firebase = useFirebase();

  useEffect(() => {
    if (room_id) {
      firebase.getRoomParticipants({
        next: async (snapshot: QuerySnapshot<DocumentData>) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "modified") refetch();
          });
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

export function useGetRoomNotification(
  options: UseQueryOptions<{ notifications: RoomNotificationModel }, any> & {
    room_id?: string;
  } = {},
) {
  const [me] = useMe();
  const socket = useSocket();
  const { room_id: roomIdParam } = useParams<{ room_id }>();
  const room_id = roomIdParam || options.room_id;
  const { refetch, data, ...resProps } = useQuery<
    { notifications: RoomNotificationModel },
    any
  >(
    "room_notifications",
    async () => {
      const res = await axios.get(
        `/notifications/${me?.user_id}/rooms/${room_id}`,
      );
      return res.data;
    },
    {
      ...options,
      enabled: options.enabled || false,
      onSuccess: callAllFunctions((data) => {
        setRoomNotifications(data.notifications);
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
  const [roomNotifications, setRoomNotifications] =
    useState<RoomNotificationModel>(
      data?.notifications || {
        "waiting-room": false,
        participants: false,
      },
    );
  const [messages, setMessages] = useContext(MessageContext);

  useEffect(() => {
    socket?.on("GET_ROOM_NOTIFICATION", refetch);

    return () => {
      socket?.off("GET_ROOM_NOTIFICATION", () => {});
    };
  }, []);

  return { roomNotifications, refetch, ...resProps };
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
      firebase.getRoomMeetings(room_id, {
        next: async (snapshot: QuerySnapshot<DocumentData>) => {
          snapshot.docChanges().forEach(() => {
            refetch();
          });
        },
      });
    }

    return () => {
      if (room_id) {
        const unsub = firebase.getRoomMeetings(room_id);
        unsub();
      }
    };
  }, [room_id]);

  return { roomMeetings, refetch, ...resProps };
}

export function useGetMeetingRoomInfo(
  { room_id, meeting_id }: { room_id: string; meeting_id: string },
  options: UseQueryOptions<RoomMeetingModel, any> = {},
) {
  return useQuery<RoomMeetingModel, any>(
    "meeting-room-info",
    async () => {
      const res = await axios.get(`/meetings/${room_id}/${meeting_id}`);
      return res.data.meeting_info;
    },
    {
      ...options,
      refetchOnWindowFocus: options.refetchOnWindowFocus || false,
      enabled: options.enabled || false,
    },
  );
}

export function useGetRoomParticipantFaces(
  options: UseQueryOptions<RoomParticipantFaceModel[], any> = {},
) {
  const [me] = useMe();
  const { room_id } = useParams<{ room_id }>();

  return useQuery<RoomParticipantFaceModel[], any>(
    "room-participant-face",
    async () => {
      const res = await axios.get(`/rooms/${room_id}/faces/${me.user_id}`);
      return res.data.user_faces;
    },
    {
      ...options,
      enabled: options.enabled || false,
      refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    },
  );
}

export function useGetRoomFaces(
  options: UseQueryOptions<RoomFacesModel[], any> = {},
) {
  const { room_id } = useParams<{ room_id }>();

  return useQuery<RoomFacesModel[], any>(
    "room-faces",
    async () => {
      const res = await axios.get(`/rooms/${room_id}/faces`);
      return res.data.room_faces;
    },
    {
      ...options,
      enabled: options.enabled || false,
      refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    },
  );
}
