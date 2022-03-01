import { ParticipantType } from "../api-hooks/type";

export const menus = [
  {
    name: undefined,
    label: "Home",
    sidebar: true,
  },
  {
    name: "participants",
    label: "Pariticipants",
    sidebar: true,
  },
  {
    name: "waiting-room",
    label: "Waiting Room",
    role: [ParticipantType.HOST, ParticipantType.CO_HOST],
    sidebar: true,
  },
  {
    name: "meeting",
    sidebar: false,
  },
  // {
  //   name: "settings",
  //   label: "Settings",
  // },
];

export const FACE_DESCRIPTION_MAX_RESULTS = 160;
export const DRAW_TIME_INTERVAL = 300;
export const MAX_FACES = 2;
export const MATCHING_THRESHOLD = 0.5;
