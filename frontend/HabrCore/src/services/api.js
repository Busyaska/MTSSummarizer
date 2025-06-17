const API_BASE = 'https://api';

export default {
  checkQueueStatus: async () => {
    const response = await fetch(`${API_BASE}/status/`);
    return response.json();
  },

  createAnalysis: async (url) => {
    const response = await fetch(`${API_BASE}/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return response.json();
  },

  getAnalysisResults: async (articleId) => {
    const response = await fetch(`${API_BASE}/article/${articleId}/`);
    return response.json();
  },

  getLatestArticles: async () => {
    const response = await fetch(`${API_BASE}/latest/`);
    return response.json();
  },

  // Новые методы
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (email, password) => {
    const response = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  submitReview: async (reviewData) => {
    const response = await fetch(`${API_BASE}/reviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return response.json();
  },

// Админские методы
  admin: {
    getStats: async () => {
      const response = await fetch(`${API_BASE}/admin/stats`);
      return response.json();
    },
    getUsers: async (page = 1, limit = 10, search = '') => {
      const response = await fetch(
        `${API_BASE}/admin/users?page=${page}&limit=${limit}&search=${search}`
      );
      return response.json();
    },
    
    toggleUserBlock: async (userId, block) => {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block })
      });
      return response.json();
    },
    
    getQueue: async (page = 1, limit = 10) => {
      const response = await fetch(
        `${API_BASE}/admin/queue?page=${page}&limit=${limit}`
      );
      return response.json();
    },
    deleteTask: async (taskId) => {
      const response = await fetch(`${API_BASE}/admin/queue/${taskId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    
    getLogs: async (page = 1, limit = 10, filters = {}) => {
      const query = new URLSearchParams({ ...filters, page, limit }).toString();
      const response = await fetch(`${API_BASE}/admin/logs?${query}`);
      return response.json();
    },
    
    exportData: async (type, filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE}/admin/export/${type}?${query}`);
      return response.blob();
    },
    saveSEOSettings: async (settings) => {
      const response = await fetch(`${API_BASE}/admin/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return response.json();
    },
    
  getFeedback: async (page = 1, limit = 10, status = 'all') => {
    try {
      const query = new URLSearchParams({ page, limit, status }).toString();
      const response = await fetch(`${API_BASE}/admin/feedback?${query}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Ошибка получения обратной связи:', error);
      throw error;
    }
  },
  
    updateFeedbackStatus: async (id, status) => {
      try {
        const response = await fetch(`${API_BASE}/admin/feedback/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        throw error;
      }
    },
    
    deleteFeedback: async (id) => {
      try {
        const response = await fetch(`${API_BASE}/admin/feedback/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Ошибка удаления обращения:', error);
        throw error;
      }
    }
  },
    createBackup: async (type) => {
      const response = await fetch(`${API_BASE}/admin/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      return response.json();
    },
    
    restoreBackup: async (id) => {
      const response = await fetch(`${API_BASE}/admin/backup/${id}/restore`, {
        method: 'POST'
      });
      return response.json();
    },
    
    getAnalytics: async (period) => {
      const response = await fetch(`${API_BASE}/admin/analytics?period=${period}`);
      return response.json();
    }
  }
