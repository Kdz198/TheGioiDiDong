import type { Permission } from "@/interfaces/user.types";
import { ROUTES } from "@/router/routes.const";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { user, isLoggedIn, token, login, logout, isTokenExpired, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  const isCustomer = user?.role === "customer";
  const isStaff = user?.role === "staff";
  const isAdmin = user?.role === "admin";

  const permissions: Permission[] = user?.allPermissions ?? [];

  const checkPermission = (permission: Permission): boolean => hasPermission(permission);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return {
    user,
    isLoggedIn,
    token,
    isCustomer,
    isStaff,
    isAdmin,
    permissions,
    login,
    handleLogout,
    isTokenExpired,
    hasPermission: checkPermission,
  };
}
