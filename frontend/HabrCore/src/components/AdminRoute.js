import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Компонент защищённого маршрута для администраторов.
 * Проверяет, авторизован ли пользователь (isAuthenticated) и
 * имеет ли он роль администратора (isAdmin)
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
