import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import LeaveReviewPage from './pages/LeaveReviewPage';
import ErrorPage from './pages/ErrorPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import './styles.css';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  // Состояние отображения боковой панели
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Состояние темы и инициализация
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    return savedTheme;
  });

  // Синхронизация темы с DOM и localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Переключение темы
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AuthProvider>
      {/* Контейнер уведомлений */}
      <ToastContainer position="top-right" autoClose={5000} />

      <Router>
        <div className="app-container">
          {/* Боковая панель видна, если isSidebarOpen = true */}
          {isSidebarOpen && <Sidebar />}
          <div className="main-area">
            <Header 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} // Кнопка скрытия/открытия бок. панели
              onToggleTheme={toggleTheme} // Кнопка переключения темы
              themeMode={theme} // Текущая тема
            />

            <main className="content">
              <Routes>
                {/* Главная страница только для авторизированных пользователей */}
                <Route path="/" element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                } />

                {/* Страницы авторизации */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/confirm-email" element={<EmailConfirmationPage />} />
                <Route path="/leave-review" element={<LeaveReviewPage />} />

                {/*Админ-панель*/}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />

                {/* Страница ошибки 404 или другие */}
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
