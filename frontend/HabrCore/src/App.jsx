import React, { useState, createContext, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailConfirmationPage from './pages/EmailConfirmationPage'
import LeaveReviewPage from './pages/LeaveReviewPage'
import ErrorPage from './pages/ErrorPage'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import './styles.css'

/**
 * ThemeContext
 * предоставляет текущую тему (light/dark)
 * и функцию toggleTheme для переключения темы.
 */
export const ThemeContext = createContext()

/**
 * App — корневой компонент приложения.
 * Отвечает за
 *  смену темы интерфейса
 *  отображение боковой панели с историей запросов
 *  маршрутизацию между страницами
 */
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) //боковая панель
  const [theme, setTheme] = useState('light')              //тема

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme) //подключаем стили  из css файла для темы
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light')) //переключаем темы
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <div className="app-container">
          {/* Боковая панель с историей запросов и ссылкой «Оставить отзыв» */}
          {isSidebarOpen && <Sidebar />}
          <div className="main-area">
            {/* Заголовок с логотипом, кнопками */}
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* переключение страниц */}
            <main className="content">
              <Routes>
                {/* Главная страница анализа статьи */}
                <Route path="/" element={<HomePage />} />
                {/* страница входа */}
                <Route path="/login" element={<LoginPage />} />
                {/* страница регистрации */}
                <Route path="/register" element={<RegisterPage />} />
                {/* Подтверждение почты */}
                <Route path="/confirm-email" element={<EmailConfirmationPage />} />
                {/* Форма с отзывом на сервис */}
                <Route path="/leave-review" element={<LeaveReviewPage />} />
                {/* старица ошибки 404 */}
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeContext.Provider>
  )
}
