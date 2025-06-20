import React from 'react';

const RecentArticles = ({ articles }) => {
  // Проверка, что articles — это массив с элементами
  if (!Array.isArray(articles) || articles.length === 0) {
    return <div className="no-articles">Нет последних статей для отображения</div>;
  }

  return (
    <div className="articles-container">
      {articles.slice(0, 5).map((article, index) => (
        <div key={index} className="article-card">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="article-title"
          >
            {article.title}
          </a>
          <div className="article-meta">
            <span className="article-date">{article.publish_time}</span>
            <span className="article-domain">habr.com</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentArticles;
