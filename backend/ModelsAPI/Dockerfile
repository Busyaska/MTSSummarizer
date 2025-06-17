FROM python:3.12

WORKDIR /modelsapi

COPY ./requirements.txt /modelsapi/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /modelsapi/requirements.txt

COPY ./ /modelsapi/

CMD [ "uvicorn", "summary_models_api:app", "--host", "0.0.0.0", "--port", "8080" ]