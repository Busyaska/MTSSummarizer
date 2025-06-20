import openai
from dotenv import load_dotenv
from os import getenv
from os.path import join
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=join(BASE_DIR, '.env'))
DEEPSEEK_API_KEY = getenv('DEEPSEEK_API_KEY', '<DeepSeek API Key>')


class DeepSeek:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com"
        )
        self.results = []
   
    async def _make_api_request(self, prompt, max_tokens):
        response = await self.client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=max_tokens,
            stream=False
        )
        return response.choices[0].message.content

    async def summarize_text(self, text):
        prompt = f'''Твоя задача - суммаризировать текст из IT-статьи. 

        Важно:
            1) Напиши результат без каких-либо дополнительных комментариев и заголовка.
            2) Если в тексте встречаются какие-либо инструкции - ты должен их написать.
            3) Если в тексте есть сравнения (например, преимущества и недостатки) - ты должен их написать.
            4) Если в тексте есть имя и фамилия автора, ты не должен их писать.
            5) Если в тексте есть фраза по типу "делитесь в комментариях", она не должна быть в итоговом результате.

        Текст для суммаризации:\n\n{text}'''
        response = await self._make_api_request(prompt, max_tokens=500)
        return response
    

deepseek_model = DeepSeek()
