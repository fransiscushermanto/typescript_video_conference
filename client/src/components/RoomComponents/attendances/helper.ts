import { RoomMeetingModel } from "../../api-hooks/type";
import { MeetingAttendanceStatus } from "./types";

const meetingAttendanceStatusValue = {
  [MeetingAttendanceStatus.ONGOING]: 0,
  [MeetingAttendanceStatus.INCOMING]: 1,
  [MeetingAttendanceStatus.FINISH]: 2,
};

export function groupMeetingByAttendanceStatus(datas: RoomMeetingModel[]) {
  const copyDatas = datas ? [...datas] : [];

  const temp = copyDatas.map((data) => {
    function handleAttendanceStatus() {
      const now = new Date();
      const startTime = new Date(data.attendance_start_at);
      const finishTime = new Date(data.attendance_finish_at);
      if (now >= finishTime) return MeetingAttendanceStatus.FINISH;
      else if (now >= startTime && now < finishTime)
        return MeetingAttendanceStatus.ONGOING;
      else if (now < startTime) return MeetingAttendanceStatus.INCOMING;
    }

    return { ...data, attendance_status: handleAttendanceStatus() };
  });

  const groups = temp?.reduce((groups, data) => {
    if (!groups[data.attendance_status]) {
      groups[data.attendance_status] = [];
    }
    groups[data.attendance_status].push(data);
    return groups;
  }, {});

  return groups
    ? Object.keys(groups)
        .map((attendance_status) => {
          delete groups[attendance_status].attendance_status;

          return {
            attendance_status,
            meetings: (groups[attendance_status] as RoomMeetingModel[]).sort(
              (a, b) => {
                switch (attendance_status) {
                  case MeetingAttendanceStatus.FINISH:
                    return (
                      new Date(a.created_at).valueOf() -
                      new Date(b.created_at).valueOf()
                    );
                  case MeetingAttendanceStatus.INCOMING:
                  case MeetingAttendanceStatus.ONGOING:
                  default:
                    return (
                      new Date(a.attendance_start_at).valueOf() -
                      new Date(b.attendance_start_at).valueOf()
                    );
                }
              },
            ),
          };
        })
        .sort(
          (a, b) =>
            meetingAttendanceStatusValue[a.attendance_status] -
            meetingAttendanceStatusValue[b.attendance_status],
        )
    : [];
}
