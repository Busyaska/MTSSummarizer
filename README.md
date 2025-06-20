# MTC-Habr-Summarizer для платформы [Habr](https://habr.com)

 "HabrCore" — это интеллектуальный веб-сервис, созданный для пользователей, которые хотят быстро и эффективно получать информацию из статей и комментариев на платформе Habr. Сервис использует современные методы обработки естественного языка (NLP) для автоматического анализа и суммаризации текстов.

## Функциональность:

- Загрузка статьи по URL
- Генерация краткого резюме статьи
- Анализ комментариев:
  - группировка по темам (кластеризация)
  - оценка тональности (позитив/негатив)
  - определение субъективности и ключевых слов
- Авторизация пользователей
- Сбор обратной связи и история запросов
- Оценка качества суммаризации (BLEU, ROUGE, BERTScore, HARIM+)
- Переключение светлой/тёмной темы интерфейса

## Запуск:

<ol>
<li>Установить <b>docker</b></li>
<li>Настроить файл <code>backend/MTSSummarizerBackend/MTSSummarizerBackend/settings.py </code>:
<ul>
<li> Установить <code>DEBUG=False</code></li>
<li> Указать хост в поле <code>ALLOWED_HOSTS</code></li>
</ul></li>
<li>Настроить файл <code>backend/MTSSummarizerBackend/.env </code></li>
<li>В корневой директории проекта выполнить команды:
<ul>
<li><code>docker compose up --build</code></li>
<li><code>docker compose exec mts-summarizer python manage.py collectstatic</code></li>
<li><code>docker compose exec mts-summarizer python manage.py migrate</code></li>
</ul></li>
</ol>