
import { useState, useEffect, createContext, useContext } from "react";

interface User {
  username: string;
  fullName: string;
  institution: string;
  npsn?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isRegistered: boolean;
  login: (userData: User) => void;
  logout: () => void;
  register: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check registration status
    const registered = localStorage.getItem('isRegistered') === 'true';
    setIsRegistered(registered);

    // Check login status
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn && registered) {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        setUser(JSON.parse(currentUser));
        setIsLoggedIn(true);
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  };

  const register = () => {
    setIsRegistered(true);
    localStorage.setItem('isRegistered', 'true');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isRegistered,
      login,
      logout,
      register
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
