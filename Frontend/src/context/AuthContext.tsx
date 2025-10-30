import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DatabaseService } from '../services/database';
import { nanoid } from 'nanoid'; // Added for mock user ID creation
// Removed: import { supabase } from '../supabaseClient';

interface AuthContextType {
// ... (interface remains the same)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
// ... (hook remains the same)
};

// Mock authentication logic (REPLACES SUPABASE AUTH)
const MOCK_AUTH_USERS: { [key: string]: { id: string, name: string, role: 'user' | 'admin' } } = {
  'alice@example.com': { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Alice Johnson', role: 'user' },
  'bob@example.com': { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Bob Smith', role: 'user' },
  'admin@skillswap.com': { id: 'auth_admin_id', name: 'Admin User', role: 'admin' },
};
const MOCK_PASSWORD = 'password123';
const MOCK_ADMIN_PASSWORD = 'admin';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load simulation (replaces onAuthStateChange)
  useEffect(() => {
    const mockCheckSession = async () => {
        const initialUserEmail = localStorage.getItem('mockUserEmail');
        if (initialUserEmail) {
            const authInfo = MOCK_AUTH_USERS[initialUserEmail];
            if (authInfo) {
                const dbUser = await DatabaseService.getUserById(authInfo.id);
                setUser(dbUser);
            }
        }
        setIsLoading(false);
    };
    mockCheckSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const authInfo = MOCK_AUTH_USERS[email];
    const expectedPassword = authInfo?.role === 'admin' ? MOCK_ADMIN_PASSWORD : MOCK_PASSWORD;

    if (authInfo && password === expectedPassword) {
      const dbUser = await DatabaseService.getUserById(authInfo.id);
      if (dbUser) {
        setUser(dbUser);
        localStorage.setItem('mockUserEmail', email); 
        setIsLoading(false);
        return true;
      }
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setIsLoading(true);
    localStorage.removeItem('mockUserEmail'); 
    setUser(null);
    setIsLoading(false);
  };

const register = async (userData: Partial<User & {password?: string}>): Promise<boolean> => {
    
    if (MOCK_AUTH_USERS[userData.email || '']) {
        return false;
    }

    // 1. Mock Auth Service Registration
    const newAuthId = nanoid();
    const newUserInfo = {
        id: newAuthId,
        name: userData.name || '',
        email: userData.email || '',
        role: 'user'
    };
    MOCK_AUTH_USERS[newUserInfo.email] = newUserInfo;
    
    // 2. Mock MongoDB Profile Creation
    const newUser: User = {
        id: newAuthId,
        name: userData.name || '',
        email: userData.email || '',
        location: userData.location,
        profilePhoto: undefined,
        skillsOffered: userData.skillsOffered || [],
        skillsWanted: userData.skillsWanted || [],
        availability: userData.availability || [],
        isPublic: userData.isPublic ?? true,
        role: 'user',
        rating: 5.0,
        totalSwaps: 0,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true
    } as User;
    
    const dbUser = await DatabaseService.createUser(newUser);
    
    return !!dbUser;
  };
  
  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await DatabaseService.updateUser(user.id, userData);
        if (updatedUser) {
          const newUser = { ...user, ...updatedUser };
          setUser(newUser);
        }
      } catch (error) {
        console.error('Update user error:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};