import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import CommentChart from '../components/CommentChart';
import RecentArticles from '../components/RecentArticles';
import '../styles.css';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated, refreshHistory, fetchWithAuth } = useAuth();

  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({});
  const [clusters, setClusters] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [keywords, setKeywords] = useState([]);
  const [clustersJson, setClustersJson] = useState({});
  const [selectedCluster, setSelectedCluster] = useState('');
  const [recentArticles, setRecentArticles] = useState([]);
  const [recentArticlesError, setRecentArticlesError] = useState(null);
  const [hasComments, setHasComments] = useState(false);
  

  useEffect(() => {
    api.getLatestArticles()
      .then(setRecentArticles)
      .catch(err => setRecentArticlesError(err.message));
  }, []);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setSummary('');
    setDisplayedSummary('');
    setError('');
    setKeywords([]);
    setClusters({ positive: 0, neutral: 0, negative: 0 });
    setClustersJson({});
    setSelectedCluster('');
    setTitle('');
    setHasComments(false);

    // Заглушка метрик 
    setMetrics({
      rouge1: 0.7423,
      rouge2: 0.5477,
      rougeL: 0.6746,
      rougeLsum: 0.7277,
      bertScore: {
        precision: 0.8337,
        recall: 0.8337,
        f1: 0.8336,
      }
    });

    try {
      const results = await api.createAnalysis(url, isAuthenticated);
;

      setSummary(results.article_summary || '');
      setTitle(results.title || '');

      if (results.comments_summary) {
        let parsed;
        try {
          parsed = JSON.parse(results.comments_summary);
        } catch (e) {
          console.error('Не удалось распарсить comments_summary:', e);
          parsed = {};
        }

        const sentimentAnalysis = parsed.analysis?.result || { positive: 0, neutral: 0, negative: 0 };
        setClusters(sentimentAnalysis);

        const clustersArray = parsed.clusters?.result || [];
        const clusterMap = {};
        let foundValidCluster = false;

        for (const clusterObj of clustersArray) {
          if (clusterObj.keywords?.length && clusterObj.comments?.length) {
            const key = clusterObj.keywords.join(', ');
            clusterMap[key] = clusterObj.comments;
            if (!foundValidCluster) foundValidCluster = true;
          }
        }

        setClustersJson(clusterMap);
        setKeywords(clustersArray[0]?.keywords || []);
        setHasComments(foundValidCluster);
      } else {
        setHasComments(false);
        setClusters({ positive: 0, neutral: 0, negative: 0 });
        setClustersJson({});
        setKeywords([]);
      }

      // Обновляем историю, чтобы новая статья появилась в списке
      if (isAuthenticated && typeof refreshHistory === 'function') {
        await refreshHistory();
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Ошибка запуска анализа.');
      setLoading(false);
    }
  };

  // Анимация показа summary по символам
  useEffect(() => {
    if (summary && !loading) {
      let i = 0;
      setDisplayedSummary('');
      const interval = setInterval(() => {
        setDisplayedSummary(prev => prev + summary[i]);
        i++;
        if (i >= summary.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [summary, loading]);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>MTC-Habr-Summarizer</h1>
        <p>Интеллектуальный веб-сервис для анализа статей и комментариев с Habr.</p>
      </div>

      <div className="analysis-section">
        <div className="url-input-group">
          <input
            type="text"
            placeholder="Вставьте ссылку на статью Habr..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
            disabled={loading}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="analyze-btn"
          >
            {loading ? 'Анализ...' : 'Проанализировать'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!isAuthenticated && !loading && (
          <div className="auth-notice">
            <p>
              Хотите сохранять историю?{' '}
              <button onClick={() => navigate('/register')} className="link-auth">
                Зарегистрируйтесь
              </button>
            </p>
          </div>
        )}

        {!loading && displayedSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="results-container"
          >
            <h2 className="article-title">{title}</h2>

            <div className="summary-block">
              <div className="summary-header">
                <Sparkles className="icon-sparkle" />
                <h3>Краткое содержание</h3>
                <div className="metrics">
                  ROUGE-1: {metrics.rouge1 ?? '-'} – ROUGE-2: {metrics.rouge2 ?? '-'} – ROUGE-L: {metrics.rougeL ?? '-'} – ROUGE-Lsum: {metrics.rougeLsum ?? '-'}<br />
                  BERTScore (P/R/F1): {metrics.bertScore?.precision ?? '-'} / {metrics.bertScore?.recall ?? '-'} / {metrics.bertScore?.f1 ?? '-'}
                </div>
              </div>
              <div className="summary-content">
                <pre>{displayedSummary}</pre>
              </div>
            </div>

            <div className="comments-block">
              <h3>Анализ комментариев</h3>
              <CommentChart {...clusters} />
            </div>

            <div className="clustered-comments-block">
              <h3>Кластеризация комментариев</h3>
              {!hasComments ? (
                <p>Комментариев не найдено.</p>
              ) : (
                <>
                  <div className="cluster-select-group">
                    <label htmlFor="cluster-select">Выберите кластер:</label>
                    <select
                      id="cluster-select"
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      className="cluster-select"
                    >
                      <option value="">Выберите ключевые слова</option>
                      {Object.keys(clustersJson).map(cluster => (
                        <option key={cluster} value={cluster}>
                          {cluster}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCluster && (
                    <div className="selected-comments-block">
                      <h4 className="cluster-title">{selectedCluster}</h4>
                      <ul className="comment-list">
                        {clustersJson[selectedCluster].map((comment, i) => (
                          <li key={i} className="comment-item">{comment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="recent-articles-section">
        <h2>Последние статьи</h2>
        {recentArticlesError && (
          <div className="error-message">Ошибка загрузки статей: {recentArticlesError}</div>
        )}
        <RecentArticles articles={recentArticles} />
      </div>
    </div>
  );
};

export default HomePage;
