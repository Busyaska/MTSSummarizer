import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const AnalyticsPanel = () => {
  const [dateRange, setDateRange] = useState('7');
  const trafficChartRef = useRef(null);
  const pagesChartRef = useRef(null);
  
  useEffect(() => {
    // Создаем график источников трафика
    const trafficCtx = document.getElementById('trafficChart').getContext('2d');
    const trafficChart = new Chart(trafficCtx, {
      type: 'doughnut',
      data: {
        labels: ['Поисковики', 'Прямые заходы', 'Соцсети'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: [
            '#36A2EB',
            '#FF6384',
            '#FFCE56'
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Источники трафика'
          }
        }
      }
    });
    
    // Создаем график популярных страниц
    const pagesCtx = document.getElementById('pagesChart').getContext('2d');
    const pagesChart = new Chart(pagesCtx, {
      type: 'bar',
      data: {
        labels: ['Главная', 'Анализ', 'Статьи'],
        datasets: [{
          label: 'Просмотры',
          data: [1200, 850, 600],
          backgroundColor: '#ED1C24',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Популярные страницы'
          }
        }
      }
    });
    
    // Сохраняем ссылки для очистки
    trafficChartRef.current = trafficChart;
    pagesChartRef.current = pagesChart;
    
    return () => {
      trafficChart.destroy();
      pagesChart.destroy();
    };
  }, [dateRange]);
  
  const metricsData = [
    { metric: 'Посетители', value: 2450 },
    { metric: 'Просмотры', value: 5670 },
    { metric: 'Отказы', value: 32 },
    { metric: 'Конверсии', value: 4.5 },
  ];

  return (
    <div className="analytics-panel">
      <h2>Аналитика</h2>
      
      <div className="filter-group">
        <label>Период:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="1">Сегодня</option>
          <option value="7">7 дней</option>
          <option value="30">30 дней</option>
          <option value="90">90 дней</option>
        </select>
      </div>
      
      <div className="metrics-grid">
        {metricsData.map((item, index) => (
          <div key={index} className="metric-card">
            <h3>{item.value}{item.metric === 'Конверсии' ? '%' : ''}</h3>
            <p>{item.metric}</p>
          </div>
        ))}
      </div>
      
      <div className="charts-container">
        <div className="chart-container">
          <canvas id="trafficChart"></canvas>
        </div>
        <div className="chart-container">
          <canvas id="pagesChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;