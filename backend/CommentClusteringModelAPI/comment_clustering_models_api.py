from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from CommentClusteringModel import comment_clustering_model


class Request(BaseModel):
    comments_list: List[str]


class Responce(BaseModel):
    result: List[Dict[str, List[str]]]


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

@app.post('/api/v1/get-comments-clusters/', status_code=status.HTTP_201_CREATED)
async def summary(request: Request) -> Responce:
    result = comment_clustering_model.get_clusters(request.comments_list)
    return {"result": result}
