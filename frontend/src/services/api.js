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

export async function authorizedFetch(url, options = {}, withAuth = true) {
  let headers = options.headers ? { ...options.headers } : {};

  if (withAuth) {
    const token = getAccessToken();
    console.log(token);
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
    const text = await res.text();
    throw new Error(`Ошибка ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res;
}

export default {
  // Без авторизации
  checkQueueStatus: () => authorizedFetch('/api/v1/status/', {}, false),
  getLatestArticles: () => authorizedFetch('/api/v1/latest/', {}, false),
  getAnalysisResults: (id) => authorizedFetch(`/api/v1/article/${id}/`, {}, false),

  createAnalysis: (url) =>
    authorizedFetch('/api/v1/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }, false),

  // С авторизацией
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
      throw new Error(`Ошибка входа: ${err}`);
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
      throw new Error(`Ошибка регистрации: ${errorText}`);
    }

    return res.json();
  },

  refreshAccessToken,
};
