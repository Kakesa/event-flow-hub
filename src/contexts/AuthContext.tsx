import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organizer } from '@/types/models';

interface AuthContextType {
  user: Organizer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données statiques pour simulation - À remplacer par appels API backend
const MOCK_USERS: (Organizer & { password: string })[] = [
  {
    id: '1',
    fullName: 'Hope Kakesa',
    email: 'hope@example.com',
    phone: '+243123456789',
    password: 'password123',
    subscriptionType: 'premium',
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Organizer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (localStorage)
    const storedUser = localStorage.getItem('eventflow_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('eventflow_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulation d'appel API - À remplacer par votre backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('eventflow_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: 'Email ou mot de passe incorrect' };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulation d'appel API - À remplacer par votre backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      setIsLoading(false);
      return { success: false, error: 'Cet email est déjà utilisé' };
    }
    
    const newUser: Organizer = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      subscriptionType: 'free',
      createdAt: new Date().toISOString(),
    };
    
    MOCK_USERS.push({ ...newUser, password: data.password });
    setUser(newUser);
    localStorage.setItem('eventflow_user', JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventflow_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
