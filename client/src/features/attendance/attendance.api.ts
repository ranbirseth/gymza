import http from "../../api/http";

export const getAttendance = () => http.get("/attendance");
export const markAttendance = (payload: { memberId: string; status: 'present' | 'absent' }) => http.post("/attendance", payload);
