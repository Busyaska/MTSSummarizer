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
  
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({ 
    bleu: 0, 
    rouge: 0, 
    bertScore: 0, 
    harim: 0 
  });

  const [clusters, setClusters] = useState({ 
    positive: 0, 
    neutral: 0,
    negative: 0 
  });
  
  const [keywords, setKeywords] = useState([]);
  const [feedbackPrompt, setFeedbackPrompt] = useState('');
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    // Мок данные для последних статей
    const articlesFromParser = [
      {
        id: 1,
        title: 'Новые алгоритмы NLP в 2024',
        url: 'https://habr.com/ru/articles/12345/',
        date: '2025-04-15T14:30:00Z'
      },
      {
        id: 2,
        title: 'Этика искусственного интеллекта',
        url: 'https://habr.com/ru/articles/12346/',
        date: '2025-06-14T09:15:00Z'
      },
      {
        id: 3,
        title: 'Анализ комментариев на Habr',
        url: 'https://habr.com/ru/articles/12347/',
        date: '2025-05-13T18:45:00Z'
      },
      {
        id: 4,
        title: 'Машинное обучение для новичков',
        url: 'https://habr.com/ru/articles/12348/',
        date: '2025-05-15T11:20:00Z'
      },
      {
        id: 5,
        title: 'Современные фреймворки JavaScript',
        url: 'https://habr.com/ru/articles/12349/',
        date: '2022-02-12T16:00:00Z'
      }
    ];
    
    setRecentArticles(articlesFromParser);
    
    // Здесь будет реальный вызов API для получения данных
    /*
    api.getLatestArticles()
      .then(data => setRecentArticles(data))
      .catch(error => console.error('Error fetching articles:', error));
    */
  }, []);

  const startAnalysis = async () => {
    try {
      // Отправка запроса на анализ
      const response = await api.createAnalysis(url);
      
      // Получение результатов (с периодическим опросом)
      const pollResults = async () => {
        try {
          const results = await api.getAnalysisResults(response.articleId);
          
          if (results.status === 'completed') {
            // Обработка результатов
            setSummary(results.summary);
            setMetrics(results.metrics);
            setClusters(results.clusters);
            setKeywords(results.keywords);
            
            // Добавление в историю
            if (isAuthenticated) {
              addToHistory(url);
            }
          } else {
            // Повторная проверка через 5 секунд
            setTimeout(pollResults, 5000);
          }
        } catch (error) {
          console.error('Error polling results:', error);
          setError('Ошибка получения результатов анализа');
          setLoading(false);
        }
      };
      
      pollResults();
    } catch (error) {
      console.error('Error starting analysis:', error);
      setError('Не удалось начать анализ. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setSummary('');
    setFeedbackResponse('');
    setError('');

    try {
      // Проверка статуса очереди
      const status = await api.checkQueueStatus();
      
      if (!status.is_available) {
        setError('Очередь заполнена. Пожалуйста, подождите...');
        
        // Периодическая проверка каждые 30 секунд
        const intervalId = setInterval(async () => {
          try {
            const newStatus = await api.checkQueueStatus();
            if (newStatus.is_available) {
              clearInterval(intervalId);
              setError('');
              await startAnalysis();
            }
          } catch (error) {
            console.error('Error checking queue status:', error);
            setError('Ошибка проверки статуса очереди');
            clearInterval(intervalId);
            setLoading(false);
          }
        }, 30000);
        
        return;
      }
      
      await startAnalysis();
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Не удалось начать анализ. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Эффект для анимации печатания текста
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

  const handleFeedbackRequest = () => {
    if (!feedbackPrompt.trim()) return;
    
    let response = '';
    const totalComments = clusters.positive + clusters.neutral + clusters.negative;
    
    if (feedbackPrompt.toLowerCase().includes('положительные')) {
      response = `Показано ${clusters.positive} положительных комментариев (${Math.round((clusters.positive / totalComments) * 100)}%)`;
    } 
    else if (feedbackPrompt.toLowerCase().includes('отрицательные')) {
      response = `Показано ${clusters.negative} отрицательных комментариев (${Math.round((clusters.negative / totalComments) * 100)}%)`;
    }
    else {
      response = `Общий анализ комментариев:\n` +
        `Положительные: ${clusters.positive}\n` +
        `Нейтральные: ${clusters.neutral}\n` +
        `Отрицательные: ${clusters.negative}`;
    }
    
    setFeedbackResponse(response);
  };

  return (
    <div className="home-page">
      {/* Заголовок и описание сервиса */}
      <div className="hero-section">
        <h1>MTC-Habr-Summarizer</h1>
        <p>Интеллектуальный веб-сервис, созданный для пользователей, 
          которые хотят быстро и эффективно получать информацию из 
          статей и комментариев. Загрузите ссылку и получите резюме статьи.</p>
      </div>

      {/* Основной блок анализа */}
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

        {/* Отображение ошибок */}
        {error && (
          <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}

        {/* Уведомление о регистрации */}
        {!isAuthenticated && !loading && (
          <div className="auth-notice">
            <p>
              Хотите сохранять историю запросов?{' '}
              <button onClick={() => navigate('/register')} className="auth-link">
                Зарегистрируйтесь
              </button>
            </p>
          </div>
        )}

        {/* Индикатор загрузки */}
        {loading && (
          <div className="loading-indicator">
            <div className="loader"></div>
            <p>Анализируем статью и комментарии...</p>
          </div>
        )}

        {/* Результаты анализа */}
        {!loading && displayedSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="results-container"
          >
            {/* Суммаризация */}
            <div className="summary-block">
              <div className="summary-header">
                <Sparkles className="icon-sparkle" />
                <h3>Краткое содержание</h3>
                  <div className="metrics">
                    BLEU: {metrics.bleu.toFixed(2)} - 
                    ROUGE: {metrics.rouge.toFixed(2)} - 
                    BERT: {metrics.bertScore.toFixed(2)} - 
                    HARIM: {metrics.harim.toFixed(2)}
                  </div>
              </div>
              <div className="summary-content">
                <pre>{displayedSummary}</pre>
              </div>
            </div>

            {/* График комментариев */}
            <div className="comments-block">
              <h3>Анализ комментариев</h3>
              <CommentChart 
                positive={clusters.positive}
                neutral={clusters.neutral}
                negative={clusters.negative}
              />
            </div>

            {/* Ключевые слова */}
            <div className="keywords-block">
              <h3>Ключевые слова</h3>
              <div className="keywords-list">
                {keywords.map((word, index) => (
                  <span key={index} className="keyword-tag">{word}</span>
                ))}
              </div>
            </div>

            {/* Фильтрация комментариев */}
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
                <button
                  onClick={handleFeedbackRequest}
                  className="feedback-btn"
                >
                  Применить
                </button>
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
        
      {/* Последние статьи */}
      <div className="recent-articles-section">
        <h2>Последние статьи</h2>
        <RecentArticles articles={recentArticles} />
      </div>
    </div>
  );
};

export default HomePage;