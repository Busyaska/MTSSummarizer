from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch import argmax, no_grad


class SentimentAnalyzer:
    """
    Анализатор тональности текста.
    
    Attributes:
        model_name (str): Идентификатор модели на Hugging Face Hub
        tokenizer (AutoTokenizer): Токенизатор для обработки текста
        model (AutoModelForSequenceClassification): Модель классификации тональности
        id2label (dict): Сопоставление ID классов с текстовыми метками
    
    Example:
        >>> analyzer = SentimentAnalyzer("BobrovayaShishka/sentiment_mts_habr")
        >>> texts = ["Отличный сервис!", "Не понравилось", "Нормально"]
        >>> result = analyzer.analyze_batch(texts)
        >>> print(result)
        {'negative': 1, 'neutral': 1, 'positive': 1}
    """
    
    def __init__(self, model_name: str='BobrovayaShishka/sentiment_mts_habr'):
        """
        Инициализирует анализатор, загружая модель и токенизатор.
        
        Args:
            model_name: Путь к модели на Hugging Face Hub 
                        (например, "BobrovayaShishka/sentiment_mts_habr")
        """
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.id2label = self.model.config.id2label
        
        # Переводим модель в режим оценки
        self.model.eval()
    
    def analyze_batch(self, texts: list) -> dict:
        """
        Анализирует список текстов и возвращает статистику по тональностям.
        
        Args:
            texts: Список строк для анализа
            
        Returns:
            Словарь с количеством текстов каждой тональности в формате:
            {
                "negative": int,
                "neutral": int,
                "positive": int
            }
            
        Example:
            >>> analyzer.analyze_batch(["Хорошо", "Плохо"])
            {'negative': 1, 'neutral': 0, 'positive': 1}
        """
        # Токенизация текстов
        inputs = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt"
        )
        
        # Пакетное предсказание
        with no_grad():
            outputs = self.model(**inputs)
        
        # Определение классов
        predicted_classes = argmax(outputs.logits, dim=1).tolist()
        
        # Подсчет результатов
        count_dict = {"negative": 0, "neutral": 0, "positive": 0}
        for class_id in predicted_classes:
            label = self.id2label[class_id].lower()
            count_dict[label] += 1
        
        return count_dict
    
    def get_sentiment_distribution(self, texts: list) -> dict:
        """
        Алиас для analyze_batch (для совместимости с предыдущими версиями).
        """
        return self.analyze_batch(texts)
    

sentiment_analyzer_model = SentimentAnalyzer()
