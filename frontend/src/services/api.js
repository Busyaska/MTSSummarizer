function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function setAccessToken(token) {
  localStorage.setItem('accessToken', token);
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Нет refresh токена');

  const res = await fetch(`/auth/jwt/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) throw new Error('Не удалось обновить токен');

  const data = await res.json();
  setAccessToken(data.access);
  return data.access;
}

function parseApiError(data) {
  if (!data) return 'Неизвестная ошибка';

  if (typeof data === 'string') return data;

  if (data.url) {
    const urlErrors = Array.isArray(data.url) ? data.url : [data.url];
    for (const err of urlErrors) {
      if (err.includes('Ensure this field has no more than 128 characters')) {
        return 'Ссылка слишком длинная (максимум 128 символов).';
      }
      if (err.includes('Enter a valid URL')) {
        return 'Пожалуйста, введите корректный URL.';
      }
    }
  }

  if (data.detail) {
    if (data.detail.includes('No active account')) return 'Неверное имя пользователя или пароль';
    if (data.detail.includes('This is not Habr article')) return 'Это не статья с Хабра.';
    return data.detail;
  }

  if (data.password) {
    const pwErrors = Array.isArray(data.password) ? data.password : [data.password];
    return 'Пароль: ' + pwErrors.join('; ');
  }

  if (data.username) {
    const userErrors = Array.isArray(data.username) ? data.username : [data.username];
    for (const err of userErrors) {
      if (err.includes('A user with that username already exists')) {
        return 'Пользователь с таким именем уже существует.';
      
      }
    }
    return 'Имя пользователя: ' + userErrors.join('; ');
  }

  if (data.non_field_errors) {
    const nfErrors = Array.isArray(data.non_field_errors) ? data.non_field_errors : [data.non_field_errors];
    return nfErrors.join('; ');
  }

  let messages = [];
  for (const key in data) {
    if (Array.isArray(data[key])) {
      messages.push(...data[key]);
    } else if (typeof data[key] === 'string') {
      messages.push(data[key]);
    }
  }

  if (messages.length) return messages.join('; ');

  return 'Ошибка: ' + JSON.stringify(data);
}

export async function authorizedFetch(url, options = {}, withAuth = true) {
  let headers = options.headers ? { ...options.headers } : {};

  if (withAuth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  options.headers = headers;
  let res = await fetch(url, options);

  if (withAuth && res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      options.headers = headers;
      res = await fetch(url, options);
      if (res.status === 401) throw new Error('Unauthorized after refresh');
    } catch {
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Сессия истекла, требуется вход');
    }
  }

  if (!res.ok) {
    let errorText = '';
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.clone().json();
        errorText = parseApiError(data);
      } else if (contentType.includes('text/html')) {
        errorText = 'Внутренняя ошибка сервера (500). Проверьте корректность ссылки.';
      } else {
        errorText = await res.text();
      }
    } catch {
      errorText = res.statusText || 'Неизвестная ошибка';
    }
    throw new Error(`Ошибка ${res.status}: ${errorText}`);
  }

  const contentLength = res.headers.get('content-length');
  const contentType = res.headers.get('content-type') || '';

  if (res.status === 204 || contentLength === '0') {
    return null;
  }

  if (contentType.includes('application/json')) {
    return res.json();
  }

  return res;
}

export default {
  // Публичные (без авторизации) запросы
  checkQueueStatus: () => authorizedFetch('/api/v1/status/', {}, false),
  getLatestArticles: () => authorizedFetch('/api/v1/latest/', {}, false),

  // Анализ статьи
  getAnalysisResults: (id, withAuth = false) =>
    authorizedFetch(`/api/v1/article/${id}/`, {}, withAuth),

  deleteArticle: (id) =>
    authorizedFetch(`/api/v1/article/${id}/`, {
      method: 'DELETE',
    }),

  createAnalysis: (url, withAuth = false) =>
    authorizedFetch('/api/v1/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }, withAuth),

  // История запросов — только с авторизацией
  getHistoryList: () => authorizedFetch('/api/v1/list/'),

  // Авторизация
  login: async (username, password) => {
    const res = await fetch(`/auth/jwt/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.text();
      let errMsg;
      try {
        errMsg = parseApiError(JSON.parse(err));
      } catch {
        errMsg = err;
      }
      throw new Error(`Ошибка входа: ${errMsg}`);
    }

    const tokens = await res.json();
    return {
      user: { username },
      tokens,
    };
  },

  register: async (username, password) => {
    const res = await fetch(`/auth/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errMsg;
      try {
        errMsg = parseApiError(JSON.parse(errorText));
      } catch {
        errMsg = errorText;
      }
      throw new Error(`Ошибка регистрации: ${errMsg}`);
    }

    return res.json();
  },

  refreshAccessToken,
};
