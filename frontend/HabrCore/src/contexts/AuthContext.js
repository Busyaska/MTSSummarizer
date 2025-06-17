import React, { createContext, useState, useContext, useEffect } from 'react'; // Добавлены импорты

const AuthContext = createContext();

// Исправленный хук useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });

  // Перенесено выше использования
  const addToHistory = (request) => {
    const newHistory = [
      { request, date: new Date().toISOString() },
      ...history.slice(0, 9)
    ];
    setHistory(newHistory);
    localStorage.setItem('history', JSON.stringify(newHistory));
  };

  const login = (userData) => {
    const user = { 
      email: userData.email,
      role: userData.role || 'user' 
    };
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isAdmin: currentUser?.role === 'admin',
      history,
      login,
      logout,
      addToHistory
    }}>
      {children}
    </AuthContext.Provider>
  );
}
