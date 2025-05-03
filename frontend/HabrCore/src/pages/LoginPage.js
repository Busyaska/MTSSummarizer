import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

/**
 * LoginPage — страница входа в аккаунт.
 * отображает форму для ввода Email и пароля,
 * кнопку «Войти» и ссылку на страницу регистрации.
 */
export default function LoginPage() {
  return (
    <div className="page-center">
      {/*заголовок страницы */}
      <h2>Вход</h2>

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
        Войти
      </button>

      {/*ссылка на регистрацию для новых пользователей */}
      <p>
        Нет аккаунта?{' '}
        <Link to="/register" className="link-auth">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
