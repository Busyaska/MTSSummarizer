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
  const { isAuthenticated, addToHistory } = useAuth();
  const navigate = useNavigate();

  // Состояния компонента
  const [url, setUrl] = useState(''); // URL статьи
  const [summary, setSummary] = useState(''); // Полный результат суммаризации
  const [displayedSummary, setDisplayedSummary] = useState(''); // Постепенно отображаемый текст
  const [loading, setLoading] = useState(false); // Индикатор загрузки
  const [error, setError] = useState(''); // Сообщение об ошибке
  const [metrics, setMetrics] = useState({ // Метрики качества суммаризации
    bleu: 0,
    rouge: 0,
    bertScore: 0,
    harim: 0
  });

  const [clusters, setClusters] = useState({ // Анализ тональности комментариев
    positive: 0,
    neutral: 0,
    negative: 0
  });

  const [keywords, setKeywords] = useState([]); // Ключевые слова из статьи
  const [feedbackPrompt, setFeedbackPrompt] = useState(''); // Запрос пользователя на фильтрацию комментариев
  const [feedbackResponse, setFeedbackResponse] = useState(''); // Ответ на запрос
  const [recentArticles, setRecentArticles] = useState([]); // Последние проанализированные статьи

  useEffect(() => {
    api.getLatestArticles()
      .then(data => setRecentArticles(data))
      .catch(error => console.error('Ошибка загрузки статей:', error));
  }, []);

  // Обработка кнопки "Проанализировать"
  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setSummary('');
    setFeedbackResponse('');
    setError('');

    try {
      // Проверка доступности очереди
      const status = await api.checkQueueStatus();
      if (!status.is_available) {
        setError('Очередь заполнена. Подождите...');
        // Повторная проверка доступности через интервал
        const intervalId = setInterval(async () => {
          try {
            const newStatus = await api.checkQueueStatus();
            if (newStatus.is_available) {
              clearInterval(intervalId);
              setError('');
              await startAnalysis();
            }
          } catch (error) {
            console.error('Ошибка очереди:', error);
            setError('Ошибка очереди. Попробуйте позже.');
            clearInterval(intervalId);
            setLoading(false);
          }
        }, 30000);
        return;
      }
      await startAnalysis();
    } catch (error) {
      console.error('Ошибка анализа:', error);
      setError('Ошибка запуска анализа.');
      setLoading(false);
    }
  };

  // Запуск анализа статьи
  const startAnalysis = async () => {
    try {
      const response = await api.createAnalysis(url); // Создание задачи анализа
      const articleId = response.articleId;

      // Ожидание завершения анализа и получение результатов
      const pollResults = async () => {
        try {
          const results = await api.getAnalysisResults(articleId);
          if (results.status === 'completed') {
            setSummary(results.summary);
            setMetrics(results.metrics);
            setClusters(results.clusters);
            setKeywords(results.keywords);
            if (isAuthenticated) {
              addToHistory(url); // Сохранение в историю, если пользователь авторизован
            }
            setLoading(false);
          } else {
            setTimeout(pollResults, 5000); // Повтор через 5 секунд
          }
        } catch (error) {
          console.error('Ошибка получения результатов:', error);
          setError('Ошибка получения результатов.');
          setLoading(false);
        }
      };
      pollResults();
    } catch (error) {
      console.error('Ошибка старта анализа:', error);
      setError('Ошибка запуска анализа.');
      setLoading(false);
    }
  };

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

  // Обработка запроса от пользователя по тональности
  const handleFeedbackRequest = () => {
    if (!feedbackPrompt.trim()) return;
    const total = clusters.positive + clusters.neutral + clusters.negative;
    let response = '';
    if (feedbackPrompt.toLowerCase().includes('положительные')) {
      response = `Положительных: ${clusters.positive} (${Math.round((clusters.positive / total) * 100)}%)`;
    } else if (feedbackPrompt.toLowerCase().includes('отрицательные')) {
      response = `Отрицательных: ${clusters.negative} (${Math.round((clusters.negative / total) * 100)}%)`;
    } else {
      response = `Положительные: ${clusters.positive}\nНейтральные: ${clusters.neutral}\nОтрицательные: ${clusters.negative}`;
    }
    setFeedbackResponse(response);
  };

  return (
    <div className="home-page">
      {/* Заголовок и краткое описание */}
      <div className="hero-section">
        <h1>MTC-Habr-Summarizer</h1>
        <p>Интеллектуальный веб-сервис для анализа статей и комментариев с Habr.</p>
      </div>

      {/* Основной блок анализа */}
      <div className="analysis-section">
        {/* Поле ввода и кнопка анализа */}
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

        {/* Сообщения об ошибках и уведомления */}
        {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

        {!isAuthenticated && !loading && (
          <div className="auth-notice">
            <p>
              Хотите сохранять историю? <button onClick={() => navigate('/register')} className="auth-link">Зарегистрируйтесь</button>
            </p>
          </div>
        )}

        {/* Индикация процесса анализа */}
        {loading && (
          <div className="loading-indicator">
            <div className="loader"></div>
            <p>Анализируем статью...</p>
          </div>
        )}

        {/* Блок результатов анализа */}
        {!loading && displayedSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="results-container">
            {/* Суммаризация */}
            <div className="summary-block">
              <div className="summary-header">
                <Sparkles className="icon-sparkle" />
                <h3>Краткое содержание</h3>
                <div className="metrics">
                  BLEU: {metrics.bleu.toFixed(2)} - ROUGE: {metrics.rouge.toFixed(2)} - BERT: {metrics.bertScore.toFixed(2)} - HARIM: {metrics.harim.toFixed(2)}
                </div>
              </div>
              <div className="summary-content">
                <pre>{displayedSummary}</pre>
              </div>
            </div>

            {/* График анализа комментариев */}
            <div className="comments-block">
              <h3>Анализ комментариев</h3>
              <CommentChart positive={clusters.positive} neutral={clusters.neutral} negative={clusters.negative} />
            </div>

            {/* Ключевые слова */}
            <div className="keywords-block">
              <h3>Ключевые слова</h3>
              <div className="keywords-list">
                {keywords.map((w, i) => <span key={i} className="keyword-tag">{w}</span>)}
              </div>
            </div>

            {/* Фильтр по запросу пользователя */}
            <div className="feedback-block">
              <h3>Фильтр комментариев</h3>
              <div className="feedback-container">
                <input
                  type="text"
                  placeholder="Например: показать только положительные"
                  value={feedbackPrompt}
                  onChange={(e) => setFeedbackPrompt(e.target.value)}
                  className="feedback-input"
                />
                <button onClick={handleFeedbackRequest} className="feedback-btn">Применить</button>
              </div>
              {feedbackResponse && (
                <div className="feedback-response">
                  <pre>{feedbackResponse}</pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Секция с последними статьями */}
      <div className="recent-articles-section">
        <h2>Последние статьи</h2>
        <RecentArticles articles={recentArticles} />
      </div>
    </div>
  );
};

export default HomePage;
