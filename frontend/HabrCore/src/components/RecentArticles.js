import React from 'react';

const RecentArticles = ({ articles }) => {
  // Функция для форматирования даты публикации
  const formatPublicationDate = (dateString) => {
    const now = new Date();
    const pubDate = new Date(dateString);
    const diffMs = now - pubDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Форматирование в относительное время
    if (diffHours < 1) {
      return 'менее часа назад';
    } else if (diffHours < 24) {
      return `${diffHours} ${getNoun(diffHours, 'час', 'часа', 'часов')} назад`;
    } else if (diffDays === 1) {
      return 'вчера';
    } else {
      return `${diffDays} ${getNoun(diffDays, 'день', 'дня', 'дней')} назад`;
    }
  };

  // Функция для склонения существительных
  const getNoun = (number, one, two, five) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return five;
  };

  return (
    <div className="articles-container">
      {articles.slice(0, 5).map(article => (
        <div key={article.id} className="article-card">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="article-title"
          >
            {article.title}
          </a>
          <div className="article-meta">
            <span className="article-date">{formatPublicationDate(article.date)}</span>
            <span className="article-domain">habr.com</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentArticles;