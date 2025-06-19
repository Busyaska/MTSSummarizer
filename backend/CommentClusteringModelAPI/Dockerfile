FROM python:3.12

WORKDIR /commentsclusteringmodelapi

COPY ./requirements.txt /commentsclusteringmodelapi/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /commentsclusteringmodelapi/requirements.txt

COPY ./ /commentsclusteringmodelapi/

CMD [ "uvicorn", "comment_clustering_models_api:app", "--host", "0.0.0.0", "--port", "8081" ]