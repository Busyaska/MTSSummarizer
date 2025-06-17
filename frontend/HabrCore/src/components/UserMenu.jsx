import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactComponent as UserIcon } from '../assets/profile.svg';

export default function UserMenu() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  // Добавляем проверку на существование currentUser и email
  const getAvatarLetter = () => {
    if (currentUser && currentUser.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return '?';
  };

return (
  <div className="user-menu-container" ref={menuRef}>
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

      {isOpen && (
        <div className="user-menu-dropdown">
          {currentUser && (
            <>
              <div className="user-info">
                <span className="user-email">
                  {currentUser.email || 'Пользователь'}
                </span>
              </div>
              
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