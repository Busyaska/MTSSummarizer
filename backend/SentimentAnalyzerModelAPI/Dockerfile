FROM python:3.12

WORKDIR /sentimentanalyzermodelapi

COPY ./requirements.txt /sentimentanalyzermodelapi/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /sentimentanalyzermodelapi/requirements.txt

COPY ./ /sentimentanalyzermodelapi/

CMD [ "uvicorn", "sentiment_analyzer_models_api:app", "--host", "0.0.0.0", "--port", "8080" ]