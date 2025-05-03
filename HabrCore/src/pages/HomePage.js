// src/pages/HomePage.js
import React, { useState, useEffect } from 'react'
import { ReactComponent as LikeIcon } from '../assets/like.svg'
import { ReactComponent as DislikeIcon } from '../assets/dislike.svg'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import '../styles.css'

/* HomePage — основная страница анализа статьи. */
export default function HomePage() {
  // состояние URL статьи
  const [url, setUrl] = useState('')
  // полный текст резюме
  const [summary, setSummary] = useState('')
  // флаг загрузки/анализирования
  const [loading, setLoading] = useState(false)
  // метрики суммаризации
  const [metrics, setMetrics] = useState({
    bleu: 0,
    rouge: 0,
    bertScore: 0,
    harim: 0
  })
  // результаты кластеризации — положительные/отрицательные комментарии
  const [clusters, setClusters] = useState({ positive: 0, negative: 0 })
  // ключевые слова из статьи
  const [keywords, setKeywords] = useState([])
  // запрос пользователя по комментариям (обратная связь)
  const [prompt, setPrompt] = useState('')
  // ответ модели на запрос обратной связи
  const [feedback, setFeedback] = useState('')

  /**
   * handleGenerate — запускает процесс анализа статьи:
   * сбрасывает предыдущие данные
   * устанавливает loading = true
   * пока симулирует API-запрос
   * обновляет summary, metrics, clusters, keywords
   */
  const handleGenerate = () => {
    if (!url.trim()) return

    setSummary('')
    setMetrics({ bleu:0, rouge:0, bertScore:0, harim:0 })
    setClusters({ positive:0, negative:0 })
    setKeywords([])
    setPrompt('')
    setFeedback('')
    setLoading(true)

    setTimeout(() => {
      setSummary(
        `Это пример сгенерированного резюме для статьи: ${url}.\n\n` +
        `Здесь будет постепенно выводиться текст без мигающего курсора.`
      )
      setMetrics({ bleu:0.86, rouge:0.79, bertScore:0.92, harim:0.67 })
      setClusters({ positive:666, negative:3 })
      setKeywords(['технология','NLP','чай'])
      setLoading(false)
    }, 2000)
  }

  // эффект «печати» - выводим summary по одному символу
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!loading && summary) {
      let i = 0
      setDisplayed('')
      const iv = setInterval(() => {
        setDisplayed(prev => prev + summary[i])
        i++
        if (i >= summary.length) clearInterval(iv)
      }, 30)
      return () => clearInterval(iv)
    }
  }, [loading, summary])

  /**
   * handleFeedback — показывает «сводку» по комментариям от запроса пользователя
   */
  const handleFeedback = () => {
    if (!prompt.trim()) return
    setFeedback(`Сводка по запросу: «${prompt}»`)
  }

  return (
    <div className="home-container">
      {/*ввод ссылки */}
      <div className="url-section">
        <input
          type="text"
          placeholder="Вставьте ссылку на статью..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="input-field"
        />
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Обработка...' : 'Генерировать'}
        </button>
      </div>

      {/*индикатор загрузки */}
      {loading && <div className="loader" />}

      {/*результаты анализа */}
      {!loading && displayed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel">
            {/*заголовок с метриками */}
            <div className="metrics-header">
              <Sparkles className="icon-sparkle" />
              Результат анализа (
                BLEU: {metrics.bleu.toFixed(2)}, 
                ROUGE: {metrics.rouge.toFixed(2)}, 
                BERTScore: {metrics.bertScore.toFixed(2)}, 
                HARIM+: {metrics.harim.toFixed(2)}
              )
            </div>

            {/*резюме */}
            <p className="summary-text">{displayed}</p>

            {/*кластеризация комментариев */}
            <div className="cluster-section">
              <h4>Кластеризация комментариев</h4>
              <div className="cluster-row">
                <LikeIcon className="icon-like" />
                <span>{clusters.positive}</span>
                <DislikeIcon className="icon-dislike" />
                <span>{clusters.negative}</span>
              </div>
            </div>

            {/*ключевые слова */}
            <div className="keywords-section">
              <h4>Ключевые слова</h4>
              <ul className="keyword-list">
                {keywords.map(kw => <li key={kw}>{kw}</li>)}
              </ul>
            </div>

            {/*обратная связь */}
            <div className="feedback-section">
              <h4>Обратная связь</h4>
              <input
                type="text"
                placeholder="Например: «Покажи только отрицательные»"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="input-field"
              />
              <button className="btn-primary" onClick={handleFeedback}>
                Отправить
              </button>
              {feedback && <p className="feedback-text">{feedback}</p>}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
