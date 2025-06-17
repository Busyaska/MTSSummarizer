import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

export default function EmailConfirmationPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { confirmEmail } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await confirmEmail(code);
      setMessage('Email успешно подтвержден!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.message || 'Ошибка подтверждения');
    }
  };

  return (
    <div className="page-center">
      <h2>Подтверждение почты</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      <p>Введите код, отправленный на ваш email</p>
      <input
        type="text"
        placeholder="Код подтверждения"
        className="input-field-cp"
        value={code}
        onChange={e => setCode(e.target.value)}
        aria-label="Код подтверждения"
      />
      <button className="btn-primary" onClick={handleConfirm}>
        Подтвердить
      </button>
    </div>
  );
}