import { create } from 'zustand';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
