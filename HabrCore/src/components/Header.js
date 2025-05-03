import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// импорт логотипа как React-компонента
import { ReactComponent as Logo } from '../assets/logo4.svg';
// импорт иконок темы
import { ReactComponent as ThemeLightIcon } from '../assets/theme-light.svg';
import { ReactComponent as ThemeDarkIcon } from '../assets/theme-dark.svg';
// импорт иконки профиля как React-компонента
import { ReactComponent as UserIcon } from '../assets/profile.svg';

// предоставляет текущую тему и функцию toggleTheme
import { ThemeContext } from '../App';


/**
 * Header — компонент шапки.
 * отображение логотипа, переключателя темы, кнопки меню и иконки пользователя.
 */
export default function Header({ onToggleSidebar }) {
  // Хуки навигации
  const navigate = useNavigate();
  /**
   *перейти на указанный путь - navigate('/login');
   *перейти назад - navigate(-1);
   *перейти вперед - navigate(1)
   *заменить текущий URL (не добавляя в history) - navigate('/home', { replace: true });
   */
  const location = useLocation(); //возвращает объект с данными о текущем URL

  // Получаем из контекста текущую тему и функцию её переключения
  const { theme, toggleTheme } = useContext(ThemeContext);

  /**
   * обрабатывает кликк по логотипу:
   * если уже на главной ("/"), перезагружает страницу
   * иначе перенаправляет на главную
   */
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="header">
      {/* меню с историей */}
      <button onClick={onToggleSidebar} className="btn-icon">☰</button>

      {/* лого, при клике вызывает handleLogoClick */}
      <Logo onClick={handleLogoClick} className="logo" />

      <div className="header-right">
        {/* переключатель темы */}
        <button onClick={toggleTheme} className="btn-icon">
          {theme === 'light'
            ? <ThemeLightIcon width={24} height={24} />
            : <ThemeDarkIcon  width={24} height={24} />
          }
        </button>

        {/* Иконка пользователя при клике переводит на страницу входа*/}
        <UserIcon
          onClick={() => navigate('/login')}
          className="avatar"
          width={32}
          height={32}
        />
      </div>
    </header>
  );
}
