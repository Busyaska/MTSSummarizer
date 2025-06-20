import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import api from '../services/api';

/**
 * AnalyticsPanel - панель  для отображения аналитики
 * сайта с выбором периода и визуализацией данных 
 * (круговая диаграмма с трафиком и количество просмотров по страницам)
 */
const AnalyticsPanel = () => {
  // Выбранный период (в днях)
  const [dateRange, setDateRange] = useState('7');

  // Основные метрики
  const [metricsData, setMetricsData] = useState([]);

  // Трафик для круговой диаграммы
  const [trafficSources, setTrafficSources] = useState([]);

  // Популярные страницы для столбчатой диаграммы
  const [popularPages, setPopularPages] = useState([]);
  const trafficChartRef = useRef(null);
  const pagesChartRef = useRef(null);

  // Загрузка данных при изменении периода
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.getAnalytics(dateRange);
        setMetricsData(response.metrics || []);
        setTrafficSources(response.traffic_sources || []);
        setPopularPages(response.popular_pages || []);
      } catch (error) {
        console.error('Ошибка при получении аналитики:', error);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  // Отрисовка и обновление графиков
  useEffect(() => {
    // Если данных нет - нет графиков
    if (!trafficSources.length || !popularPages.length) return;

    const trafficCtx = document.getElementById('trafficChart')?.getContext('2d');
    const pagesCtx = document.getElementById('pagesChart')?.getContext('2d');

    if (trafficChartRef.current) trafficChartRef.current.destroy();
    if (pagesChartRef.current) pagesChartRef.current.destroy();

    // Круговая диаграмма источников трафика
    const trafficChart = new Chart(trafficCtx, {
      type: 'doughnut',
      data: {
        labels: trafficSources.map(item => item.source),
        datasets: [{
          data: trafficSources.map(item => item.value),
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Источники трафика' }
        }
      }
    });

    // Столбчатая диаграмма популярных страниц
    const pagesChart = new Chart(pagesCtx, {
      type: 'bar',
      data: {
        labels: popularPages.map(item => item.page),
        datasets: [{
          label: 'Просмотры',
          data: popularPages.map(item => item.views),
          backgroundColor: '#ED1C24'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Популярные страницы' }
        }
      }
    });

    trafficChartRef.current = trafficChart;
    pagesChartRef.current = pagesChart;

    return () => {
      trafficChart.destroy();
      pagesChart.destroy();
    };
  }, [trafficSources, popularPages]);

  return (
    <div className="analytics-panel">
      <h2>Аналитика</h2>

      <div className="filter-group">
        <label>Период:</label>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="1">Сегодня</option>
          <option value="7">7 дней</option>
          <option value="30">30 дней</option>
          <option value="90">90 дней</option>
        </select>
      </div>

      <div className="metrics-grid">
        {metricsData
          .filter(metric => metric.metric !== 'Конверсии')
          .map((item, index) => (
            <div key={index} className="metric-card">
              <h3>{item.value}</h3>
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
