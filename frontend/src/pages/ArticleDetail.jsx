import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
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

  if (loading) return <div className="article-detail-status">Загрузка...</div>;
  if (error) return <div className="article-detail-status article-detail-error">{error}</div>;
  if (!article) return <div className="article-detail-status">Статья не найдена</div>;

  return (
    <div className="article-detail-container">
      <h2 className="article-detail-title">{article.title}</h2>

      <div className="article-detail-summary-block">
        <div className="article-detail-summary-header">
          <Sparkles className="article-detail-icon-sparkle" />
          <h3>Краткое содержание</h3>
        </div>
        <pre className="article-detail-summary-text">
          {formatSummary(article.article_summary)}
        </pre>
      </div>
    </div>
  );
};

export default ArticleDetail;
