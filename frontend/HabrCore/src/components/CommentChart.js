import React from 'react';

const CommentChart = ({ positive, neutral, negative }) => {
  const total = positive + neutral + negative;
  
  return (
    <div className="comment-chart">
      <div className="chart-bar">
        <div 
          className="segment positive" 
          style={{ width: `${(positive / total) * 100}%` }}
        />
        <div 
          className="segment neutral" 
          style={{ width: `${(neutral / total) * 100}%` }}
        />
        <div 
          className="segment negative" 
          style={{ width: `${(negative / total) * 100}%` }}
        />
      </div>
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