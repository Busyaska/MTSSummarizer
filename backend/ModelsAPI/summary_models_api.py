from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from summary_models import summary_model, deepseek_model


class SummaryRequest(BaseModel):
    article_text: str
    comments_text: str


class SummaryResponce(BaseModel):
    article_summary: str
    comments_summary: str


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

@app.post('/api/v1/summarize/', status_code=status.HTTP_201_CREATED)
async def summary(request: SummaryRequest) -> SummaryResponce:
    article_summary = await deepseek_model.summarize_text(request.article_text)
    comments_summary = summary_model.get_summary(request.comments_text)
    return {"article_summary": article_summary,
            "comments_summary": comments_summary}
