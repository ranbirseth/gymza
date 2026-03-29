import { create } from "zustand";

type User = { _id: string; name: string; email: string; role: "admin" | "trainer" | "member" } | null;

type AuthState = {
  user: User;
  accessToken: string | null;
  gymId: string;
  setAuth: (user: User, accessToken: string) => void;
  setTokens: (accessToken: string) => void;
  setGymId: (gymId: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  gymId: "MAIN",
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setTokens: (accessToken) => set({ accessToken }),
  setGymId: (gymId) => set({ gymId }),
  logout: () => set({ user: null, accessToken: null })
}));
