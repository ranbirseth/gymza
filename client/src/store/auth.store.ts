import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = { 
  _id: string; 
  name: string; 
  email: string; 
  role: "admin" | "trainer" | "member";
  status: "active" | "pending" | "inactive";
} | null;

type AuthState = {
  user: User;
  accessToken: string | null;
  gymId: string;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string) => void;
  setGymId: (gymId: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      gymId: "MAIN",
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setUser: (user) => set({ user }),
      setTokens: (accessToken) => set({ accessToken }),
      setGymId: (gymId) => set({ gymId }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
