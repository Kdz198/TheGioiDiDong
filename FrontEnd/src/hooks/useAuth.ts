import { ROUTES } from "@/router/routes.const";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { user, isLoggedIn, token, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const isCustomer = user?.role === "customer";
  const isStaff = user?.role === "staff";
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return { user, isLoggedIn, token, isCustomer, isStaff, isAdmin, login, handleLogout };
}
