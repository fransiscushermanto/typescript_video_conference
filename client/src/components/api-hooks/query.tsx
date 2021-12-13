import { useContext, useEffect, useState } from "react";
import { useQuery, UseQueryOptions } from "react-query";
import axios from "../../axios-instance";
import { useFirebase } from "../../hooks";
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

interface Participants {
  user_id: string;
  status: ParticipantType;
  user_name: string;
}

export function useGetRooms(
  user_id: string,
  { onNext, onCompletion, onError }: QueryOptions = {},
) {
  const [rooms, setRooms] = useState<RoomModel[]>([]);
  const firebase = useFirebase();
  const [messages, setMessages] = useContext(MessageContext);

  useEffect(() => {
    if (user_id) {
      firebase.getRooms(user_id, {
        onNext: callAllFunctions(async (data) => {
          if (data.data()) {
            try {
              const res = await axios.get("/rooms", { params: { user_id } });
              setRooms(res.data.rooms);
            } catch (error) {
              const { message } = error.response.data;
              setMessages([
                ...messages,
                {
                  id: Date.now(),
                  message: message,
                  severity: Severities.ERROR,
                },
              ]);
            }
          }
        }, onNext),
        onError,
        onCompletion,
      });
    }

    return () => {
      if (user_id) {
        const unsub = firebase.getRooms(user_id, { onNext: () => {} });
        unsub();
      }
    };
  }, [user_id]);

  return { rooms };
}

export function useGetUsersInWaitingRoom(
  room_id: string,
  { onNext, onCompletion, onError }: QueryOptions = {},
) {
  const [usersInWaitingRoom, setUsersInWaitingRoom] = useState<
    UserInWaitingRoomModel[]
  >([]);
  const firebase = useFirebase();
  const [messages, setMessages] = useContext(MessageContext);

  useEffect(() => {
    if (room_id) {
      firebase.getUserInWaitingRoom(room_id, {
        onNext: callAllFunctions(async (data) => {
          if (data.data()) {
            try {
              const res = await axios.get("/rooms/participants/waiting", {
                params: { room_id },
              });

              setUsersInWaitingRoom(res.data.usersInWaitingRoom);
            } catch (error) {
              const { message } = error.response.data;
              setMessages([
                ...messages,
                {
                  id: Date.now(),
                  message: message,
                  severity: Severities.ERROR,
                },
              ]);
            }
          }
        }, onNext),
        onError,
        onCompletion,
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

  console.log(usersInWaitingRoom);

  return { usersInWaitingRoom };
}

export function useGetRoomParticipants(
  { user_id, room_id }: { user_id: string; room_id: string },
  options: UseQueryOptions<Participants[], any> = {},
) {
  return useQuery<Participants[], any>("room-participants", async () => {
    const res = await axios.get("/api/getRoomParticipants", {
      params: {
        user_id,
        room_id,
      },
    });
    return res.data.participants;
  });
}
