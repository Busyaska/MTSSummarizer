import React, { createContext, useState, useContext, useEffect } from 'react'; 

/**
 * Аутентификации - хранит данные о текущем пользователе, его роли, а также историю запросов.
 */
const AuthContext = createContext();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться в рамках AuthProvider');
  }
  return context;
}

/**
 * Оборачивает приложение и предоставляет контекст с данными о пользователе,
 * а также ведения истории последних 10 запросов
 * 
 * @param {React.ReactNode} children — дочерние компоненты, которые будут иметь доступ к AuthContext
 */
export function AuthProvider({ children }) {
  /**
   * Текущий пользователь. Инициализируется из localStorage,
   * чтобы сохранять сессию между перезагрузками страницы
   */
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  //История последних 10 запросов пользователя
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });

  /**
   * Добавляет новый запрос в начало истории и ограничивает длину истории 10 элементами
   * @param {string} request — описание/данные запроса, которые хотим сохранить
   */
  const addToHistory = (request) => {
    const newHistory = [
      { request, date: new Date().toISOString() },
      ...history.slice(0, 9) // сохраняем 10 записей
    ];
    setHistory(newHistory);
    localStorage.setItem('history', JSON.stringify(newHistory));
  };

  /**
   * Логинит пользователя, записывает его email и роль
   * Сохраняет данные пользователя в localStorage для сессии
   * 
   * @param {Object} userData - данные пользователя (email, role)
   */
  const login = (userData) => {
    const user = { 
      email: userData.email,
      role: userData.role || 'user' // роль по умолчанию
    };
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  /**
   * Удаляет пользователя из состояния и localStorage,
   * effectively разлогинивает пользователя
   */
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,        // true, если пользователь залогинен
      isAdmin: currentUser?.role === 'admin', // true, если роль админ
      history,                               // история запросов
      login,                                
      logout,                               
      addToHistory                          
    }}>
      {children}
    </AuthContext.Provider>
  );
}
