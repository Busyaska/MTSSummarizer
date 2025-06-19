
# Backend часть сервера суммаризации статей

  

## Запуск

  

<ol>
<li><b>Заполнить <code>.env</code> файл в папке <code>MTSSummarizerBackend</code></b></li>
<li>
<b>Основной Django API:</b><br>
Находясь в папке MTSSummarizerBackend, выполнить:<br>
<code>uvicorn MTSSummarizerBackend.asgi:application --host 0.0.0.0 --port 8000</code>
</li>
<li>
<b>API модели анализа тональности комментариев:</b><br>
Находясь в папке SentimentAnalyzerModelAPI, выполнить:<br>
<code>uvicorn sentiment_analyzer_models_api:app --host 0.0.0.0 --port 8080</code>
</li>
<li>
<b>API модели кластеризации комментариев:</b><br>
Находясь в папке CommentClusteringModelAPI, выполнить:<br>
<code>uvicorn comment_clustering_models_api:app --host 0.0.0.0 --port 8081</code>
</li>
</ol>

  

## Технологический стек

- Основной сервис:
-- Django
-- DRF в связке с ADRF - асинхнонная работа с ORM
-- asyncio и aiohttp - асинхронная отправка запросов и парсинг статей
-- BeautifulSoup - обработка статей
-- Djoser в связке с djangorestframework_simplejw - авторизация и аутентификация
-- Gunicorn в связке с Unicorn - запуск сервера
-- drf-yags - документация
- API для обращения к моделям суммаризации:
-- FastAPI
-- OpenAI - обращение к Deepseeek
-- Trasnsftormers, pytorch - модель кластеризации
-- Uvicorn - запуск сервера
- База Данных:
-- Postgres

  

## Структура проекта

```
backend
├── CommentClusteringModelAPI    # API модели кластеризации комментариев
│   ├── CommentClusteringModel.py
│   ├── Dockerfile
│   ├── comment_clustering_models_api.py
│   └── requirements.txt
├── MTSSummarizerBackend         # Основной API
│   ├── Dockerfile
│   ├── MTSSummarizerBackend
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── permissions.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── api
│   │   ├── DeepSeekModel.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── habr_parser.py
│   │   ├── migrations
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── task_queue.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── manage.py
│   └── requirements.txt
├── README.md
└── SentimentAnalyzerModelAPI   # API модели анализа тональности комментариев
    ├── Dockerfile
    ├── SentimentAnalyzerModel.py
    ├── requirements.txt
    └── sentiment_analyzer_models_api.py

```
