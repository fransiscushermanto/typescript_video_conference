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
