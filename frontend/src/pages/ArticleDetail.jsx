import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.getAnalysisResults(id, true)
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Ошибка загрузки');
        setLoading(false);
      });
  }, [id]);

  const formatSummary = (text) => {
    if (!text) return '';
    return text.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  };

  if (loading) return <div className="ad-status">Загрузка...</div>;
  if (error) return <div className="ad-status ad-error">{error}</div>;
  if (!article) return <div className="ad-status">Статья не найдена</div>;

  return (
    <div className="ad-wrapper">
      <h1 className="ad-title">{article.title}</h1>

      <section className="ad-summary">
        <h2>Краткое содержание</h2>
        <pre className="ad-summary-text">
          {formatSummary(article.article_summary)}
        </pre>
      </section>
    </div>
  );
};

export default ArticleDetail;
