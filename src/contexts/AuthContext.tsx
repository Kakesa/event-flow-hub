/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/models';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('eventflow_user');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Restaurer l'utilisateur depuis localStorage immédiatement
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // JSON invalide, on continue avec l'appel API
        }
      }

      try {
        const res = await authApi.me();
        if (res.success) {
          setUser(res.data);
          localStorage.setItem('eventflow_user', JSON.stringify(res.data));
        } else {
          logout();
        }
      } catch {
        // Si l'API échoue mais qu'on a un user local, on le garde
        if (!savedUser) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    if (isLoading) return { success: false, error: 'Déjà en cours...' };
    setIsLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      if (res.success) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('eventflow_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, error: 'Email ou mot de passe incorrect' };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    if (isLoading) return { success: false, error: 'Déjà en cours...' };
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.success) {
        const loginRes = await login(data.email, data.password);
        return loginRes;
      }
      return { success: false, error: "Erreur lors de l'inscription" };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('eventflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
