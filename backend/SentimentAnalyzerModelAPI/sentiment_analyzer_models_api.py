from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from SentimentAnalyzerModel import sentiment_analyzer_model


class Request(BaseModel):
    comments_list: List[str]


class Responce(BaseModel):
    result: Dict[str, int]


app = FastAPI()

origins = [
    'http://localhost:8000',
    'https://localhost:8000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.post('/api/v1/analyze-comments-sentiment/', status_code=status.HTTP_201_CREATED)
async def summary(request: Request) -> Responce:
    result = sentiment_analyzer_model.get_sentiment_distribution(request.comments_list)
    return {"result": result}
