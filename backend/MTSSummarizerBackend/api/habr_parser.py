import logging
import random
import requests
import aiohttp
from asyncio.exceptions import TimeoutError, CancelledError
from aiohttp_retry import RetryClient, ExponentialRetry
from typing import List, Optional, Tuple
from bs4 import BeautifulSoup
from fake_useragent import UserAgent


logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s]%(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)


class HabrParser:
    def __init__(
        self,
        proxies: Optional[List[str]] = None,
        attemps: int = 10,
        statuses: Optional[List[int]] = None,
        exceptions: Optional[List[Exception]] = None,
        timeout: int = 0
    ) -> None:
        """
        Инициализация парсера.

        :param proxies: Список прокси для использования в запросах.
        :param attemps: Количество попыток повторного запроса при ошибках.
        :param statuses: Список HTTP-статусов, при которых повторять запрос.
        :param exceptions: Список исключений, при которых повторять запрос.
        :param timeout: Таймаут для HTTP-запросов.
        """
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self.proxies = proxies
        self.retry_options = ExponentialRetry(
            attempts=attemps,
            statuses=statuses,
            exceptions=exceptions
        )
        self.ua = UserAgent()  # Генератор случайных User-Agent
    
    async def parsing_article(self, article_url: str) -> list[list[dict[str, str], list[str]]]:
        """
        Парсинг текста статей и комментариев (опционально) по списку URL статей.

        :param article_url: URL статьи для парсинга.
        :return: Список, состоящий из словаря с данными статьи и списка с комментариями к данной статье.
        """
        async with aiohttp.ClientSession(timeout=self.timeout, raise_for_status=False) as client_session:
            async with RetryClient(client_session=client_session, retry_options=self.retry_options) as retry_session:
                comment_url = f"{article_url}comments/"
                article_result = await self._get_text_from_article(retry_session, article_url)
                comment_result = await self.parsing_comment(comment_url)

                return article_result, comment_result
            
    
    async def parsing_comment(self, comment_url: str) -> list[str]:
        """
        Асинхронно парсит комментарии по указанным URL-адресам и возвращает их в виде списка.

        Args:
            comment_url (str): URL-адрес, по которому будут парситься комментарии.

        Returns:
            List[str]: Функция возвращает список комментариев.

        Пример использования:
            await parsing_comment("http://example.com/comment1")
        """
        async with aiohttp.ClientSession(timeout=self.timeout, raise_for_status=False) as client_session:
            async with RetryClient(client_session=client_session, retry_options=self.retry_options) as retry_session:
                return await self._get_text_from_comments(retry_session, comment_url)
            

    async def _get_soup(self, response: aiohttp.ClientResponse) -> BeautifulSoup:
        """
        Преобразует ответ от сервера в объект BeautifulSoup для парсинга HTML.

        :param response: Ответ от сервера.
        :return: Объект BeautifulSoup.
        """
        return BeautifulSoup(await response.text(), "html.parser")
    

    async def _get_text_from_article(self, session: RetryClient, article_page: str) -> dict[str, str]:
        """
        Парсит заголовок и текст статьи и возвращает его их в виде словаря.

        :param session: Сессия для выполнения HTTP-запросов.
        :param article_page: URL статьи для парсинга.
        :return: Словарь, в котором содержится заголовок и текст статьи.
        """
        headers = {"User-Agent": self.ua.random}
        proxy, proxy_auth = await self._get_proxy()
        article_num = article_page.split('/')[-2]
        try:
            async with session.get(article_page, proxy=proxy, proxy_auth=proxy_auth, headers=headers) as response:
                print(response.status)
                soup = await self._get_soup(response)
                article_title = soup.select_one("head > title").get_text().split(" / ")[0].strip()
                article_text = soup.select_one("div.article-formatted-body").get_text(separator='\n').strip()
                logging.info(f"Article={article_num}. Заголовок и текст статьи успешно спарсились.")
                return {"title": article_title, "text": article_text}
        except (TimeoutError, CancelledError):
            logging.warning(f"Ошибка в обработке текста статьи, article_num={article_num}.")


    async def _get_text_from_comments(self, session: RetryClient, comment_url: str) -> list[str]:
        """
        Парсит текст комментариев и возвращает их в виде списка.

        :param session: Сессия для выполнения HTTP-запросов.
        :param comment_url: URL страницы с комментариями.
        :return: Список комментариев.
        """
        headers = {"User-Agent": self.ua.random}
        proxy, proxy_auth = await self._get_proxy()
        article_num = comment_url.split('/')[-3]
        try:
            async with session.get(comment_url, proxy=proxy, proxy_auth=proxy_auth, headers=headers) as response:
                soup = await self._get_soup(response)
                comments = [comment.text.strip() for comment in soup.select("div.tm-comment__body-content_v2 p") if comment.text.strip()]
                logging.info(f"Article_num={article_num}. Успешный парсинг комментария.")
                return comments
        except (TimeoutError, CancelledError):
            logging.warning(f"Ошибка подключения или лимит таймаута комментариев, {article_num=}.")


    async def _get_proxy(self) -> Tuple[Optional[str], Optional[str]]:
        """
        Возвращает случайный прокси из списка, если он задан.

        :return: Кортеж из прокси и данных для аутентификации (если есть).
        """
        if self.proxies is None:
            return None, None
        return random.choice(self.proxies)
    

    def get_latest_articles(self) -> list[dict[str, str]]:
        """
        Получает последние 5 статей с Хабра (habr.com)
        и возвращает их в виде списка словарей с заголовком, временем публикации и URL.

        Парсит HTML-страницу https://habr.com/ru/companies/ru_mts/articles/,
        извлекает данные о статьях с помощью BeautifulSoup.

        :returns:
            list[dict[str, str]]: Список словарей, где каждый словарь содержит:
                - 'title' (str): Заголовок статьи.
                - 'publish_time' (str): Время публикации в формате строки.
                - 'url' (str): Относительный URL статьи (начинается с 'habr.com').
        """

        page = requests.get('https://habr.com/ru/companies/ru_mts/articles/')
        bs = BeautifulSoup(page.text, 'html.parser')

        latest_articles = []
        for article in bs.find_all(class_="tm-articles-list__item", limit=5):
            publish_time = article.find("time").string
            title_with_link = article.find(class_="tm-title__link")
            title = title_with_link.string
            url = 'habr.com' + title_with_link["href"]
            latest_articles.append({'title': title, 'publish_time': publish_time, 'url': url})

        return latest_articles
    

PARSER_SETTINGS = {
    "exceptions": None,  # Список исключений, при которых следует повторять запросы (например, ConnectionTimeoutError).
    "statuses": None, # Список HTTP-статусов, при которых следует повторять запросы (например, 500, 502).
    "attemps": None,  # Количество попыток повторного запроса при возникновении ошибок.
    "proxies": None,  # Список прокси для использования в запросах (например, [("http://proxy1", BasicAuth("login", "password")), ...]
    "timeout": None,  # Таймаут для HTTP-запросов (в секундах).
}

parser = HabrParser(
        proxies=PARSER_SETTINGS['proxies'],
        exceptions=PARSER_SETTINGS['exceptions'],
        timeout=PARSER_SETTINGS['timeout'],
        attemps=PARSER_SETTINGS['attemps'],
)
