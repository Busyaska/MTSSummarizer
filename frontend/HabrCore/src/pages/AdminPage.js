import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles.css';

// Импорт новых компонентов
import SEOPanel from './SEOPanel';
import ContentPanel from './ContentPanel';
import AnalyticsPanel from './AnalyticsPanel';
import BackupPanel from './BackupPanel';

export default function AdminPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Состояния для фильтров
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });
  
  // Основные данные
  const [users, setUsers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  
  // Ссылки для экспорта
  const exportLinkRef = useRef(null);

  // Загрузка данных при смене вкладки
  useEffect(() => {
    if (!isAdmin) return;
    
    setLoading(true);
    setCurrentPage(1);
    
    switch (activeTab) {
      case 'dashboard':
        loadStats();
        break;
      case 'users':
        loadUsers();
        break;
      case 'queue':
        loadQueue();
        break;
      case 'logs':
        loadLogs();
        break;
      default:
        setLoading(false);
    }
  }, [activeTab, isAdmin]);

  // Загрузка данных при изменении страницы или фильтров
  useEffect(() => {
    if (!isAdmin) return;
    
    switch (activeTab) {
      case 'users':
        loadUsers();
        break;
      case 'queue':
        loadQueue();
        break;
      case 'logs':
        loadLogs();
        break;
      default:
        break;
    }
  }, [currentPage, itemsPerPage, filters]);

  // Загрузка статистики
  const loadStats = async () => {
    try {
      const stats = await api.admin.getStats();
      setSystemStats(stats);
      setLoading(false);
    } catch (error) {
      showError('Ошибка загрузки статистики');
    }
  };

  // Загрузка пользователей
  const loadUsers = async () => {
    try {
      const data = await api.admin.getUsers(
        currentPage, 
        itemsPerPage, 
        filters.search
      );
      
      setUsers(data.users);
      setTotalItems(data.total);
      setLoading(false);
    } catch (error) {
      showError('Ошибка загрузки пользователей');
    }
  };

  // Загрузка очереди
  const loadQueue = async () => {
    try {
      const data = await api.admin.getQueue(currentPage, itemsPerPage);
      setQueue(data.tasks);
      setTotalItems(data.total);
      setLoading(false);
    } catch (error) {
      showError('Ошибка загрузки очереди');
    }
  };

  // Загрузка логов
  const loadLogs = async () => {
    try {
      const data = await api.admin.getLogs(
        currentPage, 
        itemsPerPage, 
        {
          action: filters.action,
          userId: filters.userId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        }
      );
      
      setLogs(data.logs);
      setTotalItems(data.total);
      setLoading(false);
    } catch (error) {
      showError('Ошибка загрузки логов');
    }
  };

  // Блокировка/разблокировка пользователя
  const toggleUserBlock = async (userId, isBlocked) => {
    try {
      await api.admin.toggleUserBlock(userId, !isBlocked);
      showSuccess(`Пользователь успешно ${!isBlocked ? 'заблокирован' : 'разблокирован'}`);
      loadUsers();
    } catch (error) {
      showError('Ошибка изменения статуса пользователя');
    }
  };

  // Удаление задачи из очереди
  const removeFromQueue = async (taskId) => {
    try {
      await api.admin.deleteTask(taskId);
      showSuccess('Задача успешно удалена из очереди');
      loadQueue();
    } catch (error) {
      showError('Ошибка удаления задачи');
    }
  };

  // Экспорт данных
  const exportData = async (type) => {
    try {
      const blob = await api.admin.exportData(type, filters);
      
      const url = window.URL.createObjectURL(blob);
      const a = exportLinkRef.current;
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      
      showSuccess(`Данные успешно экспортированы в ${type}_export.csv`);
    } catch (error) {
      showError('Ошибка экспорта данных');
    }
  };

  // Уведомления
  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const showError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
    });
  };

  // Обработчики изменений фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Расчет общего количества страниц
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (!isAdmin) {
    return (
      <div className="page-center">
        <h2>Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы</p>
        <button 
          className="btn-primary"
          onClick={() => navigate('/')}
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <ToastContainer />
      <a ref={exportLinkRef} style={{ display: 'none' }}></a>
      
      <h1>Административная панель</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Статистика
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button 
          className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          Очередь анализа
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Логи системы
        </button>
        <button 
          className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          SEO
        </button>
        <button 
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Отзывы
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Аналитика
        </button>
        <button 
          className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          Резервирование
        </button>
      </div>
      
      {loading ? (
        <div className="loader"></div>
      ) : (
        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="admin-stats">
              <div className="stat-card">
                <h3>Пользователи</h3>
                <p>Всего: {systemStats.totalUsers || 0}</p>
                <p>Активные: {systemStats.activeUsers || 0}</p>
                <p>Заблокированные: {systemStats.blockedUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Анализы</h3>
                <p>За сегодня: {systemStats.todayAnalysis || 0}</p>
                <p>Всего: {systemStats.totalAnalysis || 0}</p>
                <p>Среднее время: {systemStats.avgWaitTime || 0} мин</p>
              </div>
              <div className="stat-card">
                <h3>Система</h3>
                <p>Очередь: {systemStats.queueSize || 0}</p>
                <p>Нагрузка: {systemStats.systemLoad || 0}%</p>
                <p>Ошибок за день: {systemStats.dailyErrors || 0}</p>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="users-management">
              <div className="admin-toolbar">
                <input
                  type="text"
                  placeholder="Поиск пользователей..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="admin-search"
                />
                <button 
                  className="btn-export"
                  onClick={() => exportData('users')}
                >
                  Экспорт в CSV
                </button>
              </div>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Регистрация</th>
                    <th>Последний вход</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Никогда'}</td>
                      <td>
                        {user.isBlocked ? (
                          <span className="status-bad">Заблокирован</span>
                        ) : user.isActive ? (
                          <span className="status-good">Активен</span>
                        ) : (
                          <span className="status-neutral">Неактивен</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className={`btn-small ${user.isBlocked ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => toggleUserBlock(user.id, user.isBlocked)}
                        >
                          {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="pagination">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  &larr; Назад
                </button>
                <span>Страница {currentPage} из {totalPages}</span>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Вперед &rarr;
                </button>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10 на странице</option>
                  <option value={25}>25 на странице</option>
                  <option value={50}>50 на странице</option>
                </select>
              </div>
            </div>
          )}
          
          {activeTab === 'queue' && (
            <div className="queue-management">
              <div className="admin-toolbar">
                <button 
                  className="btn-export"
                  onClick={() => exportData('queue')}
                >
                  Экспорт в CSV
                </button>
              </div>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>URL</th>
                    <th>Пользователь</th>
                    <th>Время отправки</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(task => (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td className="url-cell">{task.url}</td>
                      <td>{task.userId ? `ID ${task.userId}` : 'Аноним'}</td>
                      <td>{new Date(task.submittedAt).toLocaleString()}</td>
                      <td>
                        {task.status === 'processing' 
                          ? <span className="status-processing">В обработке</span> 
                          : <span className="status-pending">Ожидание</span>
                        }
                      </td>
                      <td>
                        <button 
                          className="btn-small btn-danger"
                          onClick={() => removeFromQueue(task.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="pagination">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  &larr; Назад
                </button>
                <span>Страница {currentPage} из {totalPages}</span>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Вперед &rarr;
                </button>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10 на странице</option>
                  <option value={25}>25 на странице</option>
                  <option value={50}>50 на странице</option>
                </select>
              </div>
            </div>
          )}
          
          {activeTab === 'logs' && (
            <div className="logs-management">
              <div className="filters-container">
                <div className="filter-group">
                  <label>Действие:</label>
                  <select
                    name="action"
                    value={filters.action}
                    onChange={handleFilterChange}
                  >
                    <option value="">Все действия</option>
                    <option value="login">Вход в систему</option>
                    <option value="logout">Выход из системы</option>
                    <option value="analysis">Анализ статьи</option>
                    <option value="block">Блокировка</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>ID пользователя:</label>
                  <input
                    type="text"
                    name="userId"
                    value={filters.userId}
                    onChange={handleFilterChange}
                    placeholder="ID пользователя"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Дата с:</label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <div className="filter-group">
                  <label>Дата по:</label>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <button 
                  className="btn-export"
                  onClick={() => exportData('logs')}
                >
                  Экспорт в CSV
                </button>
              </div>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>Действие</th>
                    <th>Пользователь</th>
                    <th>IP</th>
                    <th>Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.action}</td>
                      <td>{log.userId || 'Система'}</td>
                      <td>{log.ip}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="pagination">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  &larr; Назад
                </button>
                <span>Страница {currentPage} из {totalPages}</span>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Вперед &rarr;
                </button>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10 на странице</option>
                  <option value={25}>25 на странице</option>
                  <option value={50}>50 на странице</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'seo' && <SEOPanel />}
          {activeTab === 'content' && <ContentPanel />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'backup' && <BackupPanel />}
        </div>
      )}
    </div>
  );
}