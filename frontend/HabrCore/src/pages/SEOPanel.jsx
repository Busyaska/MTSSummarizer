import React, { useState } from 'react';

const SEOPanel = () => {
  const [seoData, setSeoData] = useState({
    title: 'MTC-Habr-Summarizer',
    description: 'Интеллектуальный веб-сервис для анализа статей Habr',
    keywords: 'анализ текста, NLP, искусственный интеллект, Habr',
  });

  const [urlSettings, setUrlSettings] = useState({
    useCleanUrls: true,
    generateSitemap: true,
  });

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  const handleUrlChange = (e) => {
    const { name, checked } = e.target;
    setUrlSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    // Здесь будет вызов API для сохранения настроек
    alert('SEO настройки успешно сохранены!');
  };

  return (
    <div className="seo-panel">
      <h2>SEO Настройки</h2>
      
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
      
      <button className="btn-primary" onClick={handleSave}>
        Сохранить настройки
      </button>
    </div>
  );
};

export default SEOPanel;