import React from 'react';

/**
 * Компонент CommentChart визуализирует распределение комментариев по трем категориям:
 * положительные, нейтральные и отрицательные.
 * Отображает горизонтальную "полоску" с тремя цветными сегментами.
 */
const CommentChart = ({ positive, neutral, negative }) => {
  const total = positive + neutral + negative;
  
  return (
    <div className="comment-chart">
      <div className="chart-bar">
        {/* Сегмент для положительных комментариев */}
        <div 
          className="segment positive" 
          style={{ width: `${(positive / total) * 100}%` }}
        />
        {/* Сегмент для нейтральных комментариев */}
        <div 
          className="segment neutral" 
          style={{ width: `${(neutral / total) * 100}%` }}
        />
        {/* Сегмент для отрицательных комментариев */}
        <div 
          className="segment negative" 
          style={{ width: `${(negative / total) * 100}%` }}
        />
      </div>

      {/* Легенда с цветовой маркировкой и числом комментариев */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="color-dot positive" />
          <span>Положительные: {positive}</span>
        </div>
        <div className="legend-item">
          <span className="color-dot neutral" />
          <span>Нейтральные: {neutral}</span>
        </div>
        <div className="legend-item">
          <span className="color-dot negative" />
          <span>Отрицательные: {negative}</span>
        </div>
      </div>
    </div>
  );
};

export default CommentChart;
