import { create } from "zustand";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

const getSavedUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem("auth-user") || "null");
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  token: localStorage.getItem("auth-token"),
  isLoggedIn: !!localStorage.getItem("auth-token"),
  isLoading: false,

  login: (user, token) => {
    localStorage.setItem("auth-token", token);
    localStorage.setItem("auth-user", JSON.stringify(user));
    set({ user, token, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    set({ user: null, token: null, isLoggedIn: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  updateUser: (updates) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      if (updatedUser) {
        localStorage.setItem("auth-user", JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    }),
}));
