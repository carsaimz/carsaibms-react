import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  avatar?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'carsai-auth',
      partialize: (state) => ({ user: state.user }) as AuthState,
    }
  )
);
