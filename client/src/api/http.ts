import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status !== 401 || error.config?._retry) throw error;
    error.config._retry = true;
    const { setTokens } = useAuthStore.getState();
    const resp = await axios.post(`${http.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
    setTokens(resp.data.data.accessToken);
    error.config.headers.Authorization = `Bearer ${resp.data.data.accessToken}`;
    return http(error.config);
  }
);

export default http;
