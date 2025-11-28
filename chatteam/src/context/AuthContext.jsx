import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    // In production, make API call to validate credentials
    const mockUser = {
      id: Date.now(),
      username: credentials.username,
      email: credentials.email,
      token: 'jwt_token_' + Date.now()
    };

    setUser(mockUser);
    localStorage.setItem('chatUser', JSON.stringify(mockUser));
    return mockUser;
  };

  const signup = (userData) => {
    // In production, make API call to create user
    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      token: 'jwt_token_' + Date.now()
    };

    setUser(newUser);
    localStorage.setItem('chatUser', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chatUser');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}