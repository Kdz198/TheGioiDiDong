import { useAuthStore } from "@/stores/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./routes.const";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: "customer" | "staff" | "admin";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate to={`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(location.pathname)}`} replace />
    );
  }

  if (user?.role !== role && !(role === "customer" && user?.role === "admin")) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}
