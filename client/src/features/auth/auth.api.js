import http from "../../api/http";
export const signup = (payload) => http.post("/auth/signup", payload);
export const login = (payload) => http.post("/auth/login", payload);
export const logout = () => http.post("/auth/logout", {});
