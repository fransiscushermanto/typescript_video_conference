import { useMutation, UseMutationOptions } from "react-query";
import axios from "../../axios-instance";
import { PeerOfferModel } from "./type";

export function useCheckRoom(
  options: UseMutationOptions<any, any, { room_id }> = {},
) {
  return useMutation<any, any, { room_id }>(async ({ room_id }) => {
    const res = await axios.post("/rooms/verify", {
      room_id,
    });
    return res.data;
  }, options);
}

export function useCreateRoom(
  options: UseMutationOptions<
    any,
    any,
    { room_name: string; user_id: string }
  > = {},
) {
  return useMutation<any, any, { room_name: string; user_id: string }>(
    async (params) => {
      const res = await axios.post("/rooms/create", params);
      return res.data;
    },
    options,
  );
}

export function useJoinRoom(
  options: UseMutationOptions<
    any,
    any,
    { room_id: string; room_password: string; user_id: string }
  > = {},
) {
  return useMutation<
    any,
    any,
    { room_id: string; room_password: string; user_id: string }
  >(async ({ room_id, room_password, user_id }) => {
    const res = await axios.post("/rooms/join", {
      room_id,
      room_password,
      user_id,
    });

    return res.data;
  }, options);
}

export function useUpdateUsersInWaitingRoom(
  options: UseMutationOptions<
    any,
    any,
    { room_id: string; user_id: string; action: "accept" | "reject" }
  > = {},
) {
  return useMutation<
    any,
    any,
    { room_id: string; user_id: string; action: "accept" | "reject" }
  >(async ({ room_id, user_id, action }) => {
    const res = await axios.post(
      `/rooms/${room_id}/participants/waiting/${user_id}`,
      {
        action,
      },
    );
    return res.data;
  }, options);
}

export function useDeleteRoom(
  options: UseMutationOptions<
    any,
    any,
    { room_id: string; user_id: string }
  > = {},
) {
  return useMutation<any, any, { room_id: string; user_id: string }>(
    async ({ room_id, user_id }) => {
      const res = await axios.delete(`/rooms/${room_id}`, {
        params: {
          user_id,
        },
      });
      return res.data;
    },
    options,
  );
}

export function useCreateRoomMeeting(
  options: UseMutationOptions<
    any,
    any,
    {
      user_id: string;
      room_id: string;
      meeting_name: string;
      offer: PeerOfferModel;
    }
  > = {},
) {
  return useMutation<
    any,
    any,
    {
      room_id: string;
      user_id: string;
      meeting_name: string;
      offer: PeerOfferModel;
    }
  >(async (payload) => {
    const res = await axios.post("/meetings/create", payload);
    return res.data;
  }, options);
}

export function useDeleteRoomMeeting(
  options: UseMutationOptions<
    any,
    any,
    { room_id: string; meeting_id: string }
  > = {},
) {
  return useMutation<any, any, { room_id: string; meeting_id: string }>(
    async ({ room_id, meeting_id }) => {
      const res = await axios.delete(`/meetings/${room_id}/${meeting_id}`);
      return res.data;
    },
    options,
  );
}

export function useCheckRoomMeeting(
  options: UseMutationOptions<any, any, { room_id; meeting_id }> = {},
) {
  return useMutation<any, any, { room_id; meeting_id }>(
    async ({ room_id, meeting_id }) => {
      const res = await axios.post(`/rooms/${room_id}/meetings/verify`, {
        meeting_id,
      });
      return res.data;
    },
    {
      retry: (failureCount, error) => {
        const { status } = error.response;
        return failureCount < 2 && status !== 404;
      },
      ...options,
    },
  );
}

export function useStoreFace(
  options: UseMutationOptions<
    any,
    any,
    { room_id; user_id; face_description; preview_image }
  > = {},
) {
  return useMutation<
    any,
    any,
    { room_id; user_id; face_description; preview_image }
  >(async ({ room_id, user_id, ...resParams }) => {
    const res = await axios.post(
      `/rooms/${room_id}/faces/${user_id}`,
      resParams,
    );
    return res.data;
  }, options);
}
