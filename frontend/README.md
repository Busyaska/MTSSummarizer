# MTC-Habr-Summarizer Frontend

## Стек технологий

- React — основа фронтенда, компоненты и управление состоянием.
- React Router — маршрутизация между страницами.
- Context API — хранение и переключение light/dark темы.
- Framer Motion — анимация плавного появления контента.
- HTML5 Canvas API — рисование и анимация на 404-странице.
- CSS Custom Properties + Flexbox — тема (переменные), адаптивная вёрстка, переключение light/dark.
- Node.js + npm — менеджмент пакетов и запуск dev-сервера.

## Структура проекта
```
project-root/
├── public/
│   └── index.html             # Статический HTML-шаблон с контейнером <div id="root"> для монтирования React-приложения
├── src/                       # Исходный код фронтенда
│   ├── App.jsx                # Корневой React-компонент
│   │ 
│   ├── index.js               # Точка входа: ReactDOM.createRoot рендерит <App /> в DOM
│   │   
│   ├── styles.css             # Глобальные стили
│   │ 
│   ├── components/            # UI-компоненты
│   │   ├── Header.js          # Шапка приложения
│   │   └── Sidebar.js         # Боковая панель
│   │ 
│   └── pages/                 # Страницы приложения
│       ├── HomePage.js        # Главная
│       ├── LoginPage.js       # Вход
│       ├── RegisterPage.js    # Регистрация
│       ├── EmailConfirmationPage.js # Подтверждение почты
│       ├── LeaveReviewPage.js # Оставить отзыв
│       └── ErrorPage.js       # Страница 404
└── README.md                  # Документация
```

## Установка и запуск

### Требования
- Node.js 14+ и npm 

### Клонирование репозитория
```bash
git clone https://github.com/VasilyevaElisaveta/MTC-Habr-Summarizer.git
cd MTC-Habr-Summarizer

#Установить все зависимости из package.json
npm install

# Если нужно, то ещё установить:
npm install react-router-dom framer-motion lucide-react

#Запуск проекта
npm start

#откройте в браузере: http://localhost:3000
