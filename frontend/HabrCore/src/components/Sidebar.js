import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { isAuthenticated, history } = useAuth();

  // Группировка истории по дням
  const groupHistoryByDay = () => {
    const grouped = {};
    
    history.forEach(item => {
      const date = new Date(item.date);
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
      
      if (!grouped[dayLabel]) {
        grouped[dayLabel] = [];
      }
      
      grouped[dayLabel].push(item.request);
    });
    
    return grouped;
  };

    const historyByDay = groupHistoryByDay();

  return (
    <aside className="sidebar">
      <div>
        <h3>История запросов</h3>
        <hr />
        
        {isAuthenticated ? (
          Object.keys(historyByDay).length > 0 ? (
            Object.entries(historyByDay).map(([day, items]) => (
              <div key={day} className="history-group">
                <strong>{day}</strong>
                <ul>
                  {items.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>История запросов пуста</p>
          )
        ) : (
          <div className="auth-prompt">
            <p>Войдите, чтобы видеть историю запросов</p>
            <Link to="/login" className="link-primary">
              Войти
            </Link>
          </div>
        )}
      </div>

      <Link to="/leave-review" className="link-primary">
        Оставить отзыв
      </Link>
    </aside>
  );
}