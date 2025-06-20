import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Ошибка входа');
    }
  };

  return (
    <div className="page-center">
      <h2>Вход</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="username"
          placeholder="username"
          className="input-field-reg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="input-field-reg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">
          Войти
        </button>
      </form>
      <p>
        Нет аккаунта?{' '}
        <Link to="/register" className="link-auth">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}