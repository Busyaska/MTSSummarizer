import React, { useState } from 'react';
import '../styles.css';

/**
 * EmailConfirmationPage — страница ввода кода подтверждения почты.
 * Используется после регистрации для верификации email пользователя.
 */
export default function EmailConfirmationPage() {
  // Локальное состояние для хранения введённого кода
  const [code, setCode] = useState('');

  /**
   * handleConfirm — обработчик нажатия кнопки «Подтвердить».
   * здесь будет запрос к бэку для проверки кода.
   */
  const handleConfirm = () => {
    alert(`Код подтверждения: ${code}`);
    setCode(''); // очистить поле после подтверждения
  };

  return (
    <div className="page-center">
      {/* заголовок страницы */}
      <h2>Подтверждение почты</h2>
      {/* инструкция для пользователя */}
      <p>Введите код, отправленный на ваш email</p>

      {/* поле ввода кода */}
      <input
        type="text"
        placeholder="Код подтверждения"
        className="input-field-cp"
        value={code}
        onChange={e => setCode(e.target.value)}
        aria-label="Код подтверждения"
      />

      {/*кнопка отправки кода на проверку */}
      <button className="btn-primary" onClick={handleConfirm}>
        Подтвердить
      </button>
    </div>
  );
}
