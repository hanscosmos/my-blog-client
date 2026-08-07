import { Navigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import type { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLogin = useAuth((s) => s.isLogin);
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

interface PublicRouteProps {
  children: JSX.Element;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const isLogin = useAuth((s) => s.isLogin);
  if (isLogin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
