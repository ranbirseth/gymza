import http from "../../api/http";

export const getAttendance = (params: { search?: string; date?: string } = {}) => {
  const { search = "", date = "" } = params;
  let url = `/attendance?search=${encodeURIComponent(search)}`;
  if (date) url += `&date=${date}`;
  return http.get(url);
};

export const markAttendance = (payload: { secretCode: string; action?: 'check-in' | 'check-out' }) => 
  http.post("/attendance/mark", payload);

export const manualCheckIn = (payload: { member: string; faceRecognitionMatched?: boolean }) => 
  http.post("/attendance/check-in", payload);

export const manualCheckOut = (id: string) => 
  http.patch(`/attendance/check-out/${id}`);
