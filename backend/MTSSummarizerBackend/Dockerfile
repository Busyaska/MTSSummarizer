FROM python:3.12

WORKDIR /mtssummarizerbackend

COPY ./requirements.txt /mtssummarizerbackend/requirements.txt

RUN pip install -r /mtssummarizerbackend/requirements.txt --no-cache-dir

COPY ./ /mtssummarizerbackend/

CMD [ "gunicorn",  "MTSSummarizerBackend.asgi:application", "-k", "uvicorn_worker.UvicornWorker", "-b", "0.0.0.0:8000" ]