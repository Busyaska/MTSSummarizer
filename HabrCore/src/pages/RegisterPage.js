import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

/**
 * RegisterPage — страница регистрации нового пользователя.
 * отображает форму для ввода Email и пароля,
 * кнопку «Зарегистрироваться» и ссылку для перехода на страницу входа.
 */
export default function RegisterPage() {
  return (
    <div className="page-center">
      {/* заголовок страницы */}
      <h2>Регистрация</h2>

      {/* поле ввода Email */}
      <input
        type="text"
        placeholder="Email"
        className="input-field-reg"
        aria-label="Email"
      />

      {/* поле ввода пароля */}
      <input
        type="password"
        placeholder="Пароль"
        className="input-field-reg"
        aria-label="Пароль"
      />

      {/*кнопка отправки формы */}
      <button className="btn-primary">
        Зарегистрироваться
      </button>

      {/*ссылка на страницу входа, если аккаунт уже есть */}
      <p>
        Уже есть аккаунт?{' '}
        <Link to="/login" className="link-auth">
          Войти
        </Link>
      </p>
    </div>
  );
}
