import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles.css';

/**
 * Компонент BackupPanel - панель управления резервными копиями
 * Просмотр списка существующих резервных копий
 * Создание новых
 * Восстанавливать систему из резервной копии
 * Скачивать резервные копии
 */
const BackupPanel = () => {
  const [backups, setBackups] = useState([]);
  const [backupType, setBackupType] = useState('full');
  const [schedule, setSchedule] = useState('daily');

  /**
   * Загружает список резервных копий с сервера через API
   */
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const data = await api.admin.getBackups();
        setBackups(data);
      } catch (error) {
        console.error('Ошибка загрузки резервных копий:', error);
      }
    };

    fetchBackups();
  }, []);

  //Создает резервную копию выбранного типа
  const createBackup = async () => {
    try {
      const response = await api.admin.createBackup(backupType);
      setBackups(prev => [response, ...prev]);
      alert(`Резервная копия создана: ${response.type}`);
    } catch (error) {
      console.error('Ошибка при создании резервной копии:', error);
      alert('Не удалось создать резервную копию.');
    }
  };

  // Восстанавливает систему из выбранной резервной копии.
  const restoreBackup = async (id) => {
    try {
      if (window.confirm('Вы уверены, что хотите восстановить резервную копию?')) {
        await api.admin.restoreBackup(id);
        alert('Восстановление завершено.');
      }
    } catch (error) {
      console.error('Ошибка восстановления:', error);
      alert('Не удалось восстановить систему.');
    }
  };

  return (
    <div className="backup-panel">
      <h2>Резервное копирование</h2>

      {/* Панель управления*/}
      <div className="backup-controls">
        <div className="form-group" style={{ marginBottom: '0px' }}>
          <label htmlFor="backupType">Тип резервной копии:</label>
          <select
            id="backupType"
            className="admin-input"
            value={backupType}
            onChange={(e) => setBackupType(e.target.value)}
          >
            <option value="full">Полная</option>
            <option value="incremental">Инкрементальная</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '0px' }}>
          <label htmlFor="schedule">Расписание:</label>
          <select
            id="schedule"
            className="admin-input"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          >
            <option value="disabled">Отключено</option>
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
          </select>
        </div>

        <button className="btn-primary btn-fullwidth" onClick={createBackup}>
          Создать резервную копию
        </button>
      </div>

      <h3>Существующие резервные копии</h3>

      {/* Таблица с существующими резервными копиями */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Дата создания</th>
            <th>Тип</th>
            <th>Размер</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {backups.map(backup => (
            <tr key={backup.id}>
              <td>{backup.date}</td>
              <td>{backup.type}</td>
              <td>{backup.size}</td>
              <td>
                {/* Кнопка для восстановления резервной копии */}
                <button
                  className="btn-small btn-success"
                  onClick={() => restoreBackup(backup.id)}
                >
                  Восстановить
                </button>
                {/* Ссылка для скачивания резервной копии */}
                <a
                  className="btn-small"
                  href={`${api}/admin/backup/${backup.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Скачать
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BackupPanel;
