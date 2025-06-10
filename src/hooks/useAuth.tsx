
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  full_name: string;
  email: string;
  user_image?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and check for existing session
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = () => {
    // Mock user data
    const mockUser: User = {
      name: 'john.doe@example.com',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      roles: ['System Manager', 'Property Manager']
    };
    
    setUser(mockUser);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
  };

  const handleAuthCallback = async (code: string, state: string): Promise<void> => {
    // Mock auth callback - simulate processing OAuth callback
    await new Promise(resolve => setTimeout(resolve, 1000));
    login(); // Just login the mock user for now
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
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
