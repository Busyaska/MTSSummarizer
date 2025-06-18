import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactComponent as UserIcon } from '../assets/profile.svg';

/**
 * Компонент UserMenu - выпадающее меню пользователя в шапке сайта.
 */
export default function UserMenu() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Переключение состояния открытия/закрытия меню
  const toggleMenu = () => setIsOpen(!isOpen);

  // Обработчик клика вне меню — закрывает меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Выход из аккаунта: вызывает logout, перенаправляет на страницу логина и закрывает меню
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <div className="user-menu-container" ref={menuRef}>
      {/* Кнопка с иконкой пользователя, открывающая меню */}
      <button 
        className="user-icon-btn" 
        onClick={toggleMenu}
        style={{ transform: 'translateY(-5px)' }} 
      >
        <UserIcon 
          className="avatar" 
          width={40} 
          height={40}
          style={{ transform: 'translateY(3px)' }} 
        />
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="user-menu-dropdown">
          {currentUser && (
            <>
              {/* Отображение email пользователя */}
              <div className="user-info">
                <span className="user-email">
                  {currentUser.email || 'Пользователь'}
                </span>
              </div>
              
              {/* Кнопка перехода в админ-панель, если роль admin */}
              {currentUser.role === 'admin' && (
                <button 
                  className="menu-item"
                  onClick={() => navigate('/admin')}
                >
                  Админ-панель
                </button>
              )}
            </>
          )}
          
          {/* Кнопка выхода из аккаунта */}
          <button 
            className="menu-item logout-item" 
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
