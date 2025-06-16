from rest_framework.exceptions import APIException, status
from asyncio import Queue, create_task, get_event_loop
from typing import Callable


class TaskQueue:

    def __init__(self):
        self.__queue = Queue(maxsize=5)
        create_task(self.__worker(self.__get_summary))

    async def __get_summary(self, article_text: str, comments_text: str) -> tuple[str, str]:
        return "article summary", "comments_summary"

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
