import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const loadFromStorage = (key) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState(() => loadFromStorage('user'));
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [isLoading, setIsLoading] = useState(true);

  // История анализов (для истории статей)
  const [history, setHistory] = useState([]);

  const isAuthenticated = !!currentUser && !!accessToken;

  // Сохраняем токены в стейт и localStorage
  const saveTokens = (access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  };

  const clearAuth = () => {
    setCurrentUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setHistory([]);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Вход
  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      setCurrentUser(response.user);
      saveTokens(response.tokens.access, response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      await refreshHistory(); // обновим историю после логина
    } catch (e) {
      throw new Error(e.message || 'Ошибка входа');
    }
  };

  // Регистрация
  const register = async (username, password) => {
    try {
      return await api.register(username, password);
    } catch (err) {
      throw err;
    }
  };

  // Выход
  const logout = () => {
    clearAuth();
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) throw new Error('Нет refresh токена');

    const res = await fetch(`/auth/jwt/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) throw new Error('Не удалось обновить токен');

    const data = await res.json();
    saveTokens(data.access, refreshToken);
  };

  const fetchWithAuth = async (url, options = {}) => {
    if (!accessToken) throw new Error('Нет access токена');

    let headers = options.headers ? { ...options.headers } : {};
    headers['Authorization'] = `Bearer ${accessToken}`;
    options.headers = headers;

    let res = await fetch(url, options);

    if (res.status === 401) {
      try {
        await refreshAccessToken();
        headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
        options.headers = headers;
        res = await fetch(url, options);
        if (res.status === 401) {
          throw new Error('Unauthorized после обновления токена');
        }
      } catch (e) {
        logout();
        throw new Error('Сессия истекла, требуется вход');
      }
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ошибка ${res.status}: ${text}`);
    }

    return res.json();
  };

  const refreshHistory = async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }

    try {
      const data = await fetchWithAuth('/api/v1/list/');
      setHistory(data.results || []);
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
      setHistory([]);
    }
  };

  // Проверка авторизации при старте приложения
  useEffect(() => {
    const verifyAuth = async () => {
      if (!accessToken || !refreshToken || !currentUser) {
        clearAuth();
        setIsLoading(false);
        return;
      }

      try {
        await refreshAccessToken();
        await refreshHistory(); // Загрузить историю при загрузке
      } catch (err) {
        console.warn('Автообновление токена не удалось:', err);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        fetchWithAuth,
        register,
        history,
        refreshHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
