import { ParticipantType } from "../api-hooks/type";

export const menus = [
  {
    name: undefined,
    label: "Home",
  },
  {
    name: "participants",
    label: "Pariticipants",
  },
  {
    name: "waiting-room",
    label: "Waiting Room",
    role: [ParticipantType.HOST, ParticipantType.CO_HOST],
  },
  // {
  //   name: "settings",
  //   label: "Settings",
  // },
];
