import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as Logo } from '../assets/logo4.svg';
import { ReactComponent as ThemeLightIcon } from '../assets/theme-light.svg';
import { ReactComponent as ThemeDarkIcon } from '../assets/theme-dark.svg';
import { ReactComponent as UserIcon } from '../assets/profile.svg';
import UserMenu from './UserMenu';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onToggleSidebar, onToggleTheme, themeMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, currentUser } = useAuth();


  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="header">
      <button onClick={onToggleSidebar} className="btn-icon">☰</button>
      <Logo onClick={handleLogoClick} className="logo" />
      <div className="header-right">
        {/* Обертка для иконки темы с классом */}
        <div className="theme-icon-wrapper">
          <button onClick={onToggleTheme} className="btn-icon">
            {themeMode === 'light'
              ? <ThemeLightIcon width={31} height={31} />
              : <ThemeDarkIcon width={31} height={31} />
            }
          </button>
        </div>
        
        {/* Обертка для иконки профиля с классом */}
        <div className="profile-icon-wrapper">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <UserIcon
              onClick={() => navigate('/login')}
              className="avatar"
              width={40}
              height={40}
            />
          )}
        </div>
      </div>
    </header>
  );
}