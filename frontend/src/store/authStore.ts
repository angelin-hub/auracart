import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Helper — check if a JWT is expired without a library
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds; Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("auracart_token", token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("auracart_token");
        localStorage.removeItem("auracart_user");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auracart_auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // On rehydration: if the stored token is expired, wipe the state
      onRehydrateStorage: () => (state) => {
        if (state && isTokenExpired(state.token)) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem("auracart_token");
          localStorage.removeItem("auracart_user");
        }
      },
    }
  )
);
