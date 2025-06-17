import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    try {
      await register(email, password);
      setMessage('Регистрация успешна! Проверьте почту для подтверждения.');
      setTimeout(() => navigate('/confirm-email'), 2000);
    } catch (error) {
      setError(error.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="page-center">
      <h2>Регистрация</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="input-field-reg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <input
          type="password"
          placeholder="Подтвердите пароль"
          className="input-field-reg"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">
          Зарегистрироваться
        </button>
      </form>
      <p>
        Уже есть аккаунт?{' '}
        <Link to="/login" className="link-auth">
          Войти
        </Link>
      </p>
    </div>
  );
}