import { useEffect, useState } from "react";
import { useQuery, UseQueryOptions } from "react-query";
import axios from "../../axios-instance";
import { useFirebase } from "../../hooks";
import { callAllFunctions } from "../helper";
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

  useEffect(() => {
    if (user_id) {
      firebase.getRooms(user_id, {
        onNext: callAllFunctions((data) => {
          if (data.data()) {
            const rooms = data.data().rooms;
            const filteredRoomStatus = rooms.filter(
              (room) => room.status !== RoomStatus.DECLINED,
            );
            if (filteredRoomStatus.length === 0) {
              setRooms([]);
            } else {
              filteredRoomStatus.forEach(async (room) => {
                const res = await firebase.getRoom(room.room_id);
                setRooms((prev) => [
                  ...prev.filter((room) => room.room_id !== res.room_id),
                  { ...res, status: room.status } as RoomModel,
                ]);
              });
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

  useEffect(() => {
    if (room_id) {
      firebase.getUserInWaitingRoom(room_id, {
        onNext: callAllFunctions(async (data) => {
          if (data.data()) {
            const users = data.data().users;

            users.map(async ({ user_id, status }) => {
              try {
                const { data: userInfo } = await axios.post(
                  "/api/getUserInfo",
                  { user_id },
                );

                setUsersInWaitingRoom((prev) => [
                  ...prev.filter((user) => user.user_id !== userInfo.user_id),
                  { ...userInfo, status },
                ]);
              } catch (error) {
                console.log(error);
              }
            });
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
