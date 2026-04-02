import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "../store/auth.store";

type Props = { children: ReactNode; roles?: Array<"admin" | "trainer" | "member"> };

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, accessToken, logout } = useAuthStore();
  
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  
  // Strict check for members: only "active" status allowed
  if (user.role === "member") {
    if (user.status === "pending") {
      return <Navigate to="/pending-approval" replace />;
    }
    if (user.status === "inactive") {
      // Don't logout here because it will cause infinite redirect to login
      // AppLayout will handle the logout and redirect
      return <Navigate to="/account-inactive" replace />;
    }
  }
  
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
