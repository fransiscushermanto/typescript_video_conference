import { Participant } from "../../Providers/MeetingRoomProvider";

export function groupParitcipantsByRole(datas: Participant[]) {
  const groups = datas?.reduce((groups, data) => {
    if (!groups[data.role]) {
      groups[data.role] = [];
    }
    groups[data.role].push(data);
    return groups;
  }, {});

  return groups
    ? Object.keys(groups).map((role) => {
        return {
          role,
          participants: (groups[role] as Participant[]).sort((a, b) =>
            a.user_name.localeCompare(b.user_name),
          ),
        };
      })
    : [];
}
