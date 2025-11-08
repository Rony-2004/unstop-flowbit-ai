'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: Record<string, User> = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
  manager: {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager',
  },
  viewer: {
    id: '3',
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'viewer',
  },
};

// Role permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view_dashboard', 'view_invoices', 'edit_invoices', 'delete_invoices', 'view_analytics', 'manage_users', 'chat_with_data'],
  manager: ['view_dashboard', 'view_invoices', 'edit_invoices', 'view_analytics', 'chat_with_data'],
  viewer: ['view_dashboard', 'view_invoices', 'view_analytics'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to admin for demo purposes
  const [user, setUser] = useState<User | null>(MOCK_USERS.admin);

  const login = async (email: string, password: string) => {
    // Mock login - in production, this would call an API
    const mockUser = Object.values(MOCK_USERS).find(u => u.email === email);
    if (mockUser) {
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
