import type { Permission, User } from "@/interfaces/user.types";
import { create } from "zustand";

const TOKEN_KEY = "auth-token";
const USER_KEY = "auth-user";
const EXPIRES_KEY = "auth-expires";

interface AuthState {
  user: User | null;
  token: string | null;
  /** Unix timestamp in ms when the token expires (from BE `expiresIn`) */
  expiresIn: number | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User, token: string, expiresIn?: number) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  isTokenExpired: () => boolean;
  hasPermission: (permission: Permission) => boolean;
}

const getSavedUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

const getSavedExpiresIn = (): number | null => {
  const raw = localStorage.getItem(EXPIRES_KEY);
  return raw ? Number(raw) : null;
};

const savedExpiresIn = getSavedExpiresIn();
const savedToken = localStorage.getItem(TOKEN_KEY);
// Treat as logged out if token is expired
const isInitiallyLoggedIn =
  !!savedToken && (savedExpiresIn === null || Date.now() < savedExpiresIn);

export const useAuthStore = create<AuthState>((set, get) => ({
  user: isInitiallyLoggedIn ? getSavedUser() : null,
  token: isInitiallyLoggedIn ? savedToken : null,
  expiresIn: savedExpiresIn,
  isLoggedIn: isInitiallyLoggedIn,
  isLoading: false,

  login: (user, token, expiresIn) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (expiresIn !== undefined) {
      localStorage.setItem(EXPIRES_KEY, String(expiresIn));
    }
    set({ user, token, expiresIn: expiresIn ?? null, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    set({ user: null, token: null, expiresIn: null, isLoggedIn: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  updateUser: (updates) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      if (updatedUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    }),

  isTokenExpired: () => {
    const { expiresIn } = get();
    return expiresIn !== null && Date.now() > expiresIn;
  },

  hasPermission: (permission) => {
    const { user } = get();
    return user?.allPermissions?.includes(permission) ?? false;
  },
}));
