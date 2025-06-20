import React, { useState } from 'react';
import '../styles.css';
import api from '../services/api';
/**
 * LeaveReviewPage - страница «Оставить отзыв» по сервису.
 * Пользователь вводит свои данные и текст отзыва, который затем отправляется на бэк
 */
export default function LeaveReviewPage() {
  // форма с полями
  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  /**
   * handleChange - общий обработчик изменений в любом поле формы.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e
   * когда пользователь что-то вводит в <input> или <textarea>
   * и изменяется его значение, React вызывает handleChange, передавая ему объект события e (типа ChangeEvent).
   */
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /**
    * handleSubmit — обработчик отправки формы.
    */
  const handleSubmit = async e => {
    e.preventDefault();
    
    try {
      // Отправка отзыва
      await api.submitReview(form);
      alert('Спасибо, отзыв отправлен');
      
      // Очистка формы
      setForm({
        lastName: '',
        firstName: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      alert('Ошибка при отправке отзыва');
      console.error(error);
    }
  };

  return (
    <div className="comment">
      {/* заголовок страницы */}
      <h2>Оставить отзыв</h2>

      {/* форма обратной связи */}
      <form
        onSubmit={handleSubmit}
        className="feedback-form"
        aria-label="Форма для оставления отзыва"
      >
        {/* поле «Фамилия» */}
        <input
          name="lastName"
          type="text"
          placeholder="Фамилия"
          className="input-field"
          value={form.lastName}
          onChange={handleChange}
          aria-label="Фамилия"
        />

        {/* поле «Имя» */}
        <input
          name="firstName"
          type="text"
          placeholder="Имя"
          className="input-field"
          value={form.firstName}
          onChange={handleChange}
          aria-label="Имя"
        />

        {/* поле «Телефон» */}
        <input
          name="phone"
          type="tel"
          placeholder="Телефон"
          className="input-field"
          value={form.phone}
          onChange={handleChange}
          aria-label="Телефон"
        />

        {/* поле «Email» */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input-field"
          value={form.email}
          onChange={handleChange}
          aria-label="Email"
        />

        {/* поле «Тема или характер проблемы» */}
        <input
          name="subject"
          type="text"
          placeholder="Тема или характер проблемы"
          className="input-field"
          value={form.subject}
          onChange={handleChange}
          aria-label="Тема или характер проблемы"
        />

        {/* текстовое поле для отзыва */}
        <textarea
          name="message"
          placeholder="Текст отзыва"
          rows={5}
          className="input-field"
          value={form.message}
          onChange={handleChange}
          aria-label="Текст отзыва"
        />

        {/* кнопка отправки формы */}
        <button type="submit" className="btn-primary">
          Отправить отзыв
        </button>
      </form>
    </div>
  );
}
