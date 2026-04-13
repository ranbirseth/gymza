import http from "../../api/http";
export const getAttendance = (params = {}) => {
    const { search = "", date = "" } = params;
    let url = `/attendance?search=${encodeURIComponent(search)}`;
    if (date)
        url += `&date=${date}`;
    return http.get(url);
};
export const markAttendance = (payload) => http.post("/attendance/mark", payload);
export const manualCheckIn = (payload) => http.post("/attendance/check-in", payload);
export const manualCheckOut = (id) => http.patch(`/attendance/check-out/${id}`);
