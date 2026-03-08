import { useAuthStore } from "@/stores/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./routes.const";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: "customer" | "staff" | "admin";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isLoggedIn, user, logout, isTokenExpired } = useAuthStore();
  const location = useLocation();
  const returnUrl = `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(location.pathname)}`;

  // Expired token — force logout and redirect to login
  if (isLoggedIn && isTokenExpired()) {
    logout();
    return <Navigate to={returnUrl} replace />;
  }

  if (!isLoggedIn) {
    return <Navigate to={returnUrl} replace />;
  }

  const userRole = user?.role;
  // admin can access all routes; staff can access customer routes too
  const hasAccess =
    userRole === role ||
    (role === "customer" && (userRole === "admin" || userRole === "staff")) ||
    (role === "staff" && userRole === "admin");

  if (!hasAccess) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}
