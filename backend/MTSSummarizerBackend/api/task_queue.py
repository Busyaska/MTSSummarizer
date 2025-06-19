from rest_framework.exceptions import APIException, status
from asyncio import Queue, create_task, get_event_loop
from aiohttp import ClientSession
from typing import Callable
from json import dumps
from .DeepSeekModel import deepseek_model


class TaskQueue:

    def __init__(self, maxsize: int=5):
        self.__queue = Queue(maxsize=maxsize)
        self.__started = False

    async def start(self):
        if not self.__started:
            create_task(self.__worker(self.__get_summary))
            self.__started = True

    async def __get_summary(self, article_text: str, comments_list: list[str]) -> tuple[str, str]:
        async with ClientSession() as session:
            article_summary: str = await deepseek_model.summarize_text(article_text)
            if len(comments_list) != 0:
                async with session.post("http://sentiment-analyzer-model-api:8080/api/v1/analyze-comments-sentiment/",
                                        json={"comments_list": comments_list}) as sentiment_analyzer_model_api_responce:
                    analysis: dict[str, int] = await sentiment_analyzer_model_api_responce.json()
                async with session.post("http://comments-clustering-model-api:8081/api/v1/get-comments-clusters/",
                                        json={"comments_list": comments_list}) as comments_clustering_model_api_responce:
                    clusters: list[dict[str, list[str]]] = await comments_clustering_model_api_responce.json()
                comments_result: str = dumps({"analysis": analysis, "clusters": clusters}, ensure_ascii=False)
            else: 
                comments_result: str = ""
            return article_summary, comments_result

    async def __worker(self, function: Callable):
        while True:
            article_text, comments_text, future = await self.__queue.get()
            try:
                result = await function(article_text, comments_text)
                future.set_result(result)
            except Exception as e:
                future.set_exception(e)
            finally:
                self.__queue.task_done()

    async def is_available(self) -> bool:
        return not self.__queue.full()

    async def process_task(self, article_text: str, comments_text: str) -> tuple[str, str]:
        future = get_event_loop().create_future()
        await self.__queue.put((article_text, comments_text, future))
        try:
            result = await future
            return result
        except Exception as e:
            raise APIException(f"Program got some issues during summary: {e}", code=status.HTTP_500_INTERNAL_SERVER_ERROR)


task_queue = TaskQueue()
