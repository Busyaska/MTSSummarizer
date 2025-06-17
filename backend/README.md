# Backend часть сервера суммаризации статей

## Запуск

<ol>
<li><b>Заполнить <code>.env</code> файл</b></li>
<li>
<b>Django:</b><br>
Находясь в папке MTSSummarizerBackend, выполнить:<br>
<code>uvicorn MTSSummarizerBackend.asgi:application --host 0.0.0.0 --port 8000</code>
</li>
<li>
<b>FasrAPI:</b><br>
Находясь в папке ModelsAPI, выполнить:<br>
<code>uvicorn summary_models_api:app --host 0.0.0.0 --port 8080</code>
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
├── MTSSummarizerBackend
│   ├── Dockerfile
│   ├── MTSSummarizerBackend   # основной сервис принимающий запросы
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── permissions.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── api
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
├── ModelsAPI                 # api для обращения к моделям
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── summary_models.py
│   └── summary_models_api.py
└── README.md
```
