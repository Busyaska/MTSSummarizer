import React from 'react';
import { Link } from 'react-router-dom';

/**
 * historyByDay — пример данных истории запросов
 */
const historyByDay = {
  'Сегодня': ['Запрос A', 'Запрос B'],
  'Вчера':  ['Запрос C']
};

/**
 * Sidebar — боковая панель приложения.
 * Использует:
 *  .sidebar        — контейнер панели
 *  .history-group  — контейнер группы запросов
 *  .link-primary   — стили для ссылки «Оставить отзыв»
 */
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        {/* Заголовок раздела истории */}
        <h3>История запросов</h3>
        <hr />

        {/* Перебираем ключи и значения объекта historyByDay */}
        {Object.entries(historyByDay).map(([day, items]) => (
          <div key={day} className="history-group">
            {/* Название группы (день) */}
            <strong>{day}</strong>
            {/* Список запросов этого дня */}
            <ul>
              {items.map(req => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Ссылка на страницу с формой */}
      <Link to="/leave-review" className="link-primary">
        Оставить отзыв
      </Link>
    </aside>
  );
}
