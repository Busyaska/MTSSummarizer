import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Компонент SEOPanel - панель управления SEO-настройками сайта
 * Просмотр и редактирование заголовков, описание и ключевые слова
 * Включать или выключать ЧПУ (человеко-понятные URL)
 * Сохранять изменения на сервер через API
 */
const SEOPanel = () => {
  //SEO-данные: title, description, keywords
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: ''
  });

  // Состояние настроек URL
  const [urlSettings, setUrlSettings] = useState({
    useCleanUrls: true,
    generateSitemap: true
  });

  // Индикатор загрузки настроек с сервера
  const [loading, setLoading] = useState(true);
  // Индикатор успешного сохранения
  const [success, setSuccess] = useState(false);
  // Ошибка при загрузке или сохранении настроек
  const [error, setError] = useState('');

  //Загружает текущие SEO и URL настройки с сервера через API

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.admin.getSEOSettings();

        // Обновляем SEO-данные, если они есть, иначе пустые строки
        setSeoData({
          title: response.title || '',
          description: response.description || '',
          keywords: response.keywords || ''
        });

        // Обновляем настройки URL, если данные есть, иначе true по умолчанию
        setUrlSettings({
          useCleanUrls: response.useCleanUrls ?? true,
          generateSitemap: response.generateSitemap ?? true
        });
      } catch (err) {
        setError('Ошибка загрузки настроек SEO');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  //Обновляет состояние seoData в зависимости от имени поля

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  //обновление состояния
  const handleUrlChange = (e) => {
    const { name, checked } = e.target;
    setUrlSettings(prev => ({ ...prev, [name]: checked }));
  };

  //Сохраняет текущие SEO и URL настройки на сервер

  const handleSave = async () => {
    try {
      await api.admin.saveSEOSettings({
        ...seoData,
        ...urlSettings
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setError('');
    } catch (err) {
      setError('Не удалось сохранить настройки');
    }
  };

  if (loading) return <p>Загрузка настроек...</p>;

  return (
    <div className="seo-panel">
      <h2>SEO Настройки</h2>

      {/* Выводим ошибки и уведомления об успехе */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Настройки успешно сохранены!</p>}

      {/* Поля для редактирования SEO: заголовок, описание, ключевые слова */}
      <div className="form-group">
        <label>Заголовок сайта (Title)</label>
        <input
          type="text"
          name="title"
          value={seoData.title}
          onChange={handleSeoChange}
          className="admin-input"
        />
      </div>

      <div className="form-group">
        <label>Мета-описание (Description)</label>
        <textarea
          name="description"
          value={seoData.description}
          onChange={handleSeoChange}
          className="admin-input"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Ключевые слова (Keywords)</label>
        <input
          type="text"
          name="keywords"
          value={seoData.keywords}
          onChange={handleSeoChange}
          className="admin-input"
        />
      </div>

      {/* Управление ЧПУ и генерацией sitemap */}
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="useCleanUrls"
            checked={urlSettings.useCleanUrls}
            onChange={handleUrlChange}
          />
          Использовать ЧПУ (Человеко-понятные URL)
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="generateSitemap"
            checked={urlSettings.generateSitemap}
            onChange={handleUrlChange}
          />
          Автоматически генерировать sitemap.xml
        </label>
      </div>

      {/* Кнопка сохранения */}
      <button className="btn-primary btn-fullwidth" onClick={handleSave}>
        Сохранить настройки
      </button>
    </div>
  );
};

export default SEOPanel;
