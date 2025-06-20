import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { isAuthenticated, fetchWithAuth, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Загружаем историю — мемоизированная функция, чтобы не менять ссылку
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      setError(null);
      return;
    }
    try {
      const data = await fetchWithAuth('/api/v1/list/');
      setHistory(data.results || []);
      setError(null);
    } catch (e) {
      if (e.message.includes('401')) {
        logout();
      }
      setError(e.message);
    }
  }, [isAuthenticated, fetchWithAuth, logout]);

  // Загружаем историю при монтировании и изменении аутентификации
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Группируем по дате (Сегодня, Вчера, дата)
  const groupHistoryByDay = () => {
    const grouped = {};
    history.forEach(item => {
      const date = new Date(item.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dayLabel;
      if (date.toDateString() === today.toDateString()) {
        dayLabel = 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dayLabel = 'Вчера';
      } else {
        dayLabel = date.toLocaleDateString('ru-RU');
      }

      if (!grouped[dayLabel]) grouped[dayLabel] = [];
      grouped[dayLabel].push(item);
    });
    return grouped;
  };

  const historyByDay = groupHistoryByDay();

  return (
    <aside className="sidebar">
      <div>
        <h3>История анализов</h3>
        <hr />

        {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

        {isAuthenticated ? (
          Object.keys(historyByDay).length > 0 ? (
            Object.entries(historyByDay).map(([day, items]) => (
              <div key={day} className="history-group">
                <strong>{day}</strong>
                <ul>
                  {items.map(item => (
                    <li
                      key={item.id}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      <Link
                        to={`/api/v1/article/${item.id}/`}
                        title={item.title}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {item.title.length > 40 ? item.title.slice(0, 40) + '…' : item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>История пуста</p>
          )
        ) : (
          <div className="auth-prompt">
            <p>Войдите, чтобы видеть историю</p>
            <Link to="/login" className="link-primary">Войти</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
