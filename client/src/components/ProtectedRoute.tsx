import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "../store/auth.store";

type Props = { children: ReactNode; roles?: Array<"admin" | "trainer" | "member"> };

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
