const API_BASE = 'https://habr-core.com';

export default {
  //Проверка очереди (GET /v1/status/)
  //Возвращает JSON с состоянием очереди
  checkQueueStatus: async () => {
    const response = await fetch(`${API_BASE}/v1/status/`);
    if (!response.ok) throw new Error('Ошибка очереди');
    return response.json();
  },

  //Запуск анализа (POST /v1/create/)
  //Отправляет URL для запуска анализа статьи
  //Принимает url и возвращает JSON
  createAnalysis: async (url) => {
    const response = await fetch(`${API_BASE}/v1/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!response.ok) throw new Error('Ошибка запуска анализа');
    return response.json();
  },

  //Получение результатов (GET /v1/article/<id>/)
  //Запрашивает результаты анализа статьи и возвращает JSON с результатами анализа
  getAnalysisResults: async (articleId) => {
    const response = await fetch(`${API_BASE}/v1/article/${articleId}/`);
    if (!response.ok) throw new Error('Ошибка получения результатов');
    return response.json();
  },

  //Последние статьи (GET /v1/latest/)
  //Получает список последних обработанных статей
  getLatestArticles: async () => {
    const response = await fetch(`${API_BASE}/v1/latest/`);
    if (!response.ok) throw new Error('Ошибка загрузки статей');
    return response.json();
  },

  //Суммаризация (POST /v1/summarize/)
  //Отправляет текст для получения суммаризации

  summarizeText: async (articleText, commentsText) => {
    const response = await fetch(`${API_BASE}/v1/summarize/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_text: articleText, comments_text: commentsText })
    });
    if (!response.ok) throw new Error('Ошибка суммаризации текста');
    return response.json();
  },

  //Авторизация (POST /login/)
  //Отправляет email и пароль для входа пользователя
  //Возвращает JSON
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Ошибка входа');
    return response.json();
  },

  //Регистрация (POST /register/)
  //Отправляет email и пароль для создания нового пользователя
  //Возвращает JSON
  register: async (email, password) => {
    const response = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Ошибка регистрации');
    return response.json();
  },

  //Отправка отзыва (POST /reviews/)
  //Отправляет данные отзыва для сохранения на сервере
  //reviewData - содержимое
  //Возвращает JSON
  submitReview: async (reviewData) => {
    const response = await fetch(`${API_BASE}/reviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error('Ошибка отправки отзыва');
    return response.json();
  },

    //Админ
  admin: {
    //Получить статистику сайта (GET /admin/stats/)
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats/`);
      if (!res.ok) throw new Error('Ошибка статистики');
      return res.json();
    },

    //Получить список пользователей с пагинацией и поиском (GET /admin/users/)
    getUsers: async (page = 1, limit = 10, search = '') => {
      const res = await fetch(`${API_BASE}/admin/users/?page=${page}&limit=${limit}&search=${search}`);
      if (!res.ok) throw new Error('Ошибка загрузки пользователей');
      return res.json();
    },

    //Заблокировать или разблокировать пользователя (POST /admin/users/:userId/block/)
    // userId - ID пользователя, block - true/false для блокировки.
    toggleUserBlock: async (userId, block) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/block/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block })
      });
      if (!res.ok) throw new Error('Ошибка блокировки');
      return res.json();
    },

    //Получить задачи в очереди с пагинацией (GET /admin/queue/)
    getQueue: async (page = 1, limit = 10) => {
      const res = await fetch(`${API_BASE}/admin/queue/?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Ошибка очереди');
      return res.json();
    },

    //Удалить задачу из очереди (DELETE /admin/queue/:taskId/)
    deleteTask: async (taskId) => {
      const res = await fetch(`${API_BASE}/admin/queue/${taskId}/`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка удаления задачи');
      return res.json();
    },

    //Получить логи с фильтрами и пагинацией (GET /admin/logs/)
    getLogs: async (page = 1, limit = 10, filters = {}) => {
      const query = new URLSearchParams({ ...filters, page, limit }).toString();
      const res = await fetch(`${API_BASE}/admin/logs/?${query}`);
      if (!res.ok) throw new Error('Ошибка логов');
      return res.json();
    },

    //Экспорт данных (GET /admin/export/:type/)
    exportData: async (type, filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/admin/export/${type}/?${query}`);
      if (!res.ok) throw new Error('Ошибка экспорта');
      return res.blob();
    },

    //Получить настройки SEO (GET /admin/seo)
    getSEOSettings: async () => {
      const response = await fetch(`${API_BASE}/admin/seo`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Ошибка получения SEO настроек');
      return response.json();
    },

    //Сохранить настройки SEO (POST /admin/seo)
    saveSEOSettings: async (settings) => {
      const response = await fetch(`${API_BASE}/admin/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Ошибка сохранения SEO настроек');
      return response.json();
    },

    //Получить отзывы с пагинацией и фильтром по статусу (GET /admin/feedback/)
    getFeedback: async (page = 1, limit = 10, status = 'all') => {
      const query = new URLSearchParams({ page, limit, status }).toString();
      const res = await fetch(`${API_BASE}/admin/feedback/?${query}`);
      if (!res.ok) throw new Error('Ошибка получения отзывов');
      return res.json();
    },

    //Обновить статус отзыва (PUT /admin/feedback/:id/)
    updateFeedbackStatus: async (id, status) => {
      const res = await fetch(`${API_BASE}/admin/feedback/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Ошибка обновления статуса');
      return res.json();
    },

    //Удалить отзыв (DELETE /admin/feedback/:id/)
    deleteFeedback: async (id) => {
      const res = await fetch(`${API_BASE}/admin/feedback/${id}/`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка удаления отзыва');
      return res.json();
    },

    //Создать резервную копию (POST /admin/backup)
    createBackup: async (type) => {
      const response = await fetch(`${API_BASE}/admin/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      return response.json();
    },

    //Восстановить резервную копию по ID (POST /admin/backup/:id/restore)
    restoreBackup: async (id) => {
      const response = await fetch(`${API_BASE}/admin/backup/${id}/restore`, {
        method: 'POST'
      });
      return response.json();
    },

    //Получить список резервных копий (GET /admin/backups)
    getBackups: async () => {
      const response = await fetch(`${API_BASE}/admin/backups`);
      return response.json();
    },

    // Получить аналитику (GET /admin/analytics/)
    getAnalytics: async (period) => {
      const res = await fetch(`${API_BASE}/admin/analytics/?period=${period}`);
      if (!res.ok) throw new Error('Ошибка аналитики');
      return res.json();
    }
  }
};
