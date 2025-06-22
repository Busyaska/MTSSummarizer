import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles.css';
import api from '../services/api';

export default function Sidebar() {
  const { isAuthenticated, fetchWithAuth, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 5;

  const navigate = useNavigate();
  const location = useLocation();

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      setError(null);
      setTotalPages(1);
      return;
    }

    try {
      const data = await fetchWithAuth(`/api/v1/list/?page=${page}&page_size=${PAGE_SIZE}`);
      // Сортируем по дате от новых к старым
      const sorted = (data.results || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setHistory(sorted);
      setTotalPages(Math.ceil((data.count || 0) / PAGE_SIZE));
      setError(null);
    } catch (e) {
      if (e.message.includes('401')) {
        logout();
      }
      setError(e.message);
    }
  }, [isAuthenticated, fetchWithAuth, logout, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Форматируем дату
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteArticle(id);

      // Если сейчас мы на странице удаленной статьи - перебросить на главную
      if (location.pathname === `/article/${id}`) {
        navigate('/', { replace: true });
      }
      // Обновить историю без перезагрузки страницы
      loadHistory();
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message);
    }
  };

  return (
    <aside className="sidebar">
      <h3>История анализов</h3>
      <hr />

      {error && <p className="error-message">Ошибка: {error}</p>}

      {!isAuthenticated ? (
        <div className="auth-prompt">
          <p>Войдите, чтобы видеть историю</p>
          <Link to="/login" className="link-primary">Войти</Link>
        </div>
      ) : history.length === 0 ? (
        <p>История пуста</p>
      ) : (
        <>
          <div className="history-grid">
            {history.map(item => (
              <div key={item.id} className="history-entry">
                <Link to={`/article/${item.id}`} className="history-entry-title" title={item.title}>
                  {item.title}
                </Link>
                <div className="history-entry-meta">
                  <span>{formatDate(item.created_at)}</span>
                  <button
                    className="history-entry-delete"
                    onClick={() => handleDelete(item.id)}
                    title="Удалить статью из истории"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination arrows">
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => prev - 1)}
              title="Назад"
            >
              ←
            </button>
            <span>{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(prev => prev + 1)}
              title="Вперёд"
            >
              →
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
