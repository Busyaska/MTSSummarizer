import React, { useState } from 'react';

const BackupPanel = () => {
  const [backups, setBackups] = useState([
    { id: 1, date: '2025-06-15 14:30:00', size: '45 MB', type: 'Полный' },
    { id: 2, date: '2025-06-10 09:15:00', size: '32 MB', type: 'Инкрементальный' },
  ]);
  
  const [backupType, setBackupType] = useState('full');
  const [schedule, setSchedule] = useState('daily');
  
  const createBackup = () => {
    const newBackup = {
      id: backups.length + 1,
      date: new Date().toLocaleString(),
      size: `${Math.floor(Math.random() * 20) + 30} MB`,
      type: backupType === 'full' ? 'Полный' : 'Инкрементальный'
    };
    
    setBackups([newBackup, ...backups]);
    alert(`Резервная копия создана: ${newBackup.type}`);
  };
  
  const restoreBackup = (id) => {
    const backup = backups.find(b => b.id === id);
    if (backup) {
      if (window.confirm(`Вы уверены, что хотите восстановить систему из резервной копии от ${backup.date}?`)) {
        alert(`Система восстановлена из резервной копии от ${backup.date}`);
      }
    }
  };

  return (
    <div className="backup-panel">
      <h2>Резервное копирование</h2>
      
      <div className="backup-controls">
        <div className="form-group">
          <label>Тип резервной копии:</label>
          <select
            value={backupType}
            onChange={(e) => setBackupType(e.target.value)}
          >
            <option value="full">Полная</option>
            <option value="incremental">Инкрементальная</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Расписание:</label>
          <select
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          >
            <option value="disabled">Отключено</option>
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
          </select>
        </div>
        
        <button className="btn-primary" onClick={createBackup}>
          Создать резервную копию
        </button>
      </div>
      
      <h3>Существующие резервные копии</h3>
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
                <button 
                  className="btn-small btn-success"
                  onClick={() => restoreBackup(backup.id)}
                >
                  Восстановить
                </button>
                <button className="btn-small">
                  Скачать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BackupPanel;