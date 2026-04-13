import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/auth.store";
export const useSocket = (onAttendance) => {
    const gymId = useAuthStore((s) => s.gymId);
    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
            query: { gymId }
        });
        socket.on("attendance:checkin", (data) => onAttendance("checkin", data));
        socket.on("attendance:checkout", (data) => onAttendance("checkout", data));
        return () => {
            socket.disconnect();
        };
    }, [gymId, onAttendance]);
};
