
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = apiClient.isAuthenticated() && !!user;

  useEffect(() => {
    const initAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const userData = await apiClient.getCurrentUser();
          setUser(userData.message);
        } catch (error) {
          console.error('Failed to get user data:', error);
          apiClient.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = () => {
    const authUrl = apiClient.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);
      await apiClient.exchangeCodeForToken(code, state);
      const userData = await apiClient.getCurrentUser();
      setUser(userData.message);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      handleAuthCallback,
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
