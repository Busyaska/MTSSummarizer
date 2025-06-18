import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Панель отображения и управления обратной связью от пользователей
export default function ContentPanel() {
  const [feedback, setFeedback] = useState([]); // список обращений
  const [loading, setLoading] = useState(true); // индикатор загрузки
  const [statusFilter, setStatusFilter] = useState('all'); // фильтр по статусу
  const [currentPage, setCurrentPage] = useState(1); // текущая страница
  const [totalPages, setTotalPages] = useState(1); // всего страниц
  const [itemsPerPage, setItemsPerPage] = useState(10); // элементов на странице
  const [totalItems, setTotalItems] = useState(0); // общее количество обращений

  // Загрузка списка обращений
  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getFeedback(
        currentPage, 
        itemsPerPage, 
        statusFilter === 'all' ? '' : statusFilter
      );

      //Сохраняем данные из ответа
      setFeedback(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      alert('Не удалось загрузить обращения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [currentPage, itemsPerPage, statusFilter]);

  // Обновление статуса конкретного обращения
  const updateFeedbackStatus = async (id, status) => {
    try {
      await api.admin.updateFeedbackStatus(id, status);
      setFeedback(feedback.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Не удалось обновить статус обращения');
    }
  };

  // Удаление обращения по ID
  const deleteFeedback = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это обращение?')) {
      try {
        await api.admin.deleteFeedback(id);
        // Удаляем из локального состояния
        setFeedback(feedback.filter(item => item.id !== id));
      } catch (error) {
        console.error('Ошибка удаления обращения:', error);
        alert('Не удалось удалить обращение');
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В обработке';
      case 'resolved': return 'Решено';
      case 'closed': return 'Закрыто';
      default: return status;
    }
  };

  // Список возможных статусов
  const statusOptions = [
    { value: 'new', label: 'Новый' },
    { value: 'in_progress', label: 'В обработке' },
    { value: 'resolved', label: 'Решено' },
    { value: 'closed', label: 'Закрыто' }
  ];

  return (
    <div className="feedback-panel">
      <h2>Обратная связь от пользователей</h2>

      {/* Панель фильтрации */}
      <div className="admin-toolbar">
        <div className="filter-group">
          <label>Фильтр по статусу:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // сбрасываем на первую страницу при смене фильтра
            }}
            className="admin-input"
          >
            <option value="all">Все обращения</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Отображение состояния загрузки */}
      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
          {/* Таблица с отзывами */}
          <table className="admin-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Тема</th>
                <th>Сообщение</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {feedback.length > 0 ? (
                feedback.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{item.firstName} {item.lastName}</td>
                    <td>{item.email}</td>
                    <td>{item.subject}</td>
                    <td className="message-cell">
                      <div className="message-preview">{item.message}</div>
                      {item.message.length > 100 && (
                        <button 
                          className="btn-text"
                          onClick={() => alert(item.message)} // Полный текст сообщения
                        >
                          Показать полностью
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={`status-${item.status}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {/* Изменение статуса */}
                      <select
                        value={item.status}
                        onChange={(e) => updateFeedbackStatus(item.id, e.target.value)}
                        className="status-select"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* Удаление обращения */}
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => deleteFeedback(item.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Если обращений нет
                <tr>
                  <td colSpan="7" className="no-feedback">
                    Обращений не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Пагинация */}
          <div className="pagination">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              &larr; Назад
            </button>

            <span>Страница {currentPage} из {totalPages}</span>

            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Вперед &rarr;
            </button>

            {/* Выбор количества отображаемых элементов */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // сбрасываем страницу при смене лимита
              }}
              className="admin-input"
            >
              <option value={10}>10 на странице</option>
              <option value={25}>25 на странице</option>
              <option value={50}>50 на странице</option>
            </select>

            <span>Всего: {totalItems} обращений</span>
          </div>
        </>
      )}
    </div>
  );
}
