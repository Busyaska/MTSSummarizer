// Импортируем React-библиотеку.
import React from 'react';

//ReactDOM — это библиотека, отвечающая за рендеринг React-компонентов
import ReactDOM from 'react-dom/client';

// импорт корневого компонента приложения
// App.jsx — это точка входа  SPA, где настраиваются маршруты, контексты, стили и т.д.
import App from './App';

// создаём корневой контейнер React с id="root"
// в public/index.html в теле страницы обязательно есть <div id="root"></div>
const root = ReactDOM.createRoot(
  document.getElementById('root')
);

//рендерим, запускаем React-приложение и отображает UI.
root.render(
  <App />
);
