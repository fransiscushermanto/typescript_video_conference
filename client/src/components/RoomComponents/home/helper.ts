import { format } from "date-fns";
import { RoomMeetingModel } from "../../api-hooks/type";

export function groupMeetingByDate(datas: RoomMeetingModel[]) {
  const groups = datas?.reduce((groups, data) => {
    const date = format(new Date(data.created_at), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(data);
    return groups;
  }, {});

  return groups
    ? Object.keys(groups)
        .sort((dateA, dateB) => {
          return new Date(dateA).valueOf() - new Date(dateB).valueOf();
        })
        .map((date) => {
          return {
            date,
            meetings: (groups[date] as RoomMeetingModel[]).sort(
              (a, b) =>
                new Date(a.created_at).valueOf() -
                new Date(b.created_at).valueOf(),
            ),
          };
        })
    : [];
}
