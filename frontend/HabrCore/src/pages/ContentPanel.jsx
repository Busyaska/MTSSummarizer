import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ContentPanel() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Загрузка обратной связи
  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getFeedback(
        currentPage, 
        itemsPerPage, 
        statusFilter === 'all' ? '' : statusFilter
      );
      
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

  // Обновление статуса обращения
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

  // Удаление обращения
  const deleteFeedback = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это обращение?')) {
      try {
        await api.admin.deleteFeedback(id);
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

  const statusOptions = [
    { value: 'new', label: 'Новый' },
    { value: 'in_progress', label: 'В обработке' },
    { value: 'resolved', label: 'Решено' },
    { value: 'closed', label: 'Закрыто' }
  ];

  return (
    <div className="feedback-panel">
      <h2>Обратная связь от пользователей</h2>
      
      <div className="admin-toolbar">
        <div className="filter-group">
          <label>Фильтр по статусу:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
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

      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
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
                          onClick={() => alert(item.message)}
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
            
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
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