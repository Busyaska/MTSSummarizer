import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch
import umap
import hdbscan
from sklearn.feature_extraction.text import TfidfVectorizer
from pymorphy3 import MorphAnalyzer
import nltk
from nltk.corpus import stopwords
import re
from typing import List, Dict, Tuple, Union
import logging

# Настройка логирования
logging.getLogger("transformers").setLevel(logging.ERROR)
nltk.download('stopwords')

class CommentClustering:
    """
    Класс для кластеризации русскоязычных комментариев с использованием RuRoBERTa и HDBSCAN
    
    Параметры:
    model_name (str): Название предобученной модели (по умолчанию "sberbank-ai/ruRoberta-large")
    min_cluster_size (Union[int, str]): Минимальный размер кластера. Может быть числом или 'auto' для автоматического расчета
    auto_cluster_ratio (float): Коэффициент для автоматического расчета min_cluster_size (по умолчанию 0.05)
    n_neighbors (int): Количество соседей для UMAP (по умолчанию 3)
    random_state (int): Seed для воспроизводимости (по умолчанию 42)
    """
    
    def __init__(self, 
                 model_name: str = "sberbank-ai/ruRoberta-large",
                 min_cluster_size: Union[int, str] = 2,
                 auto_cluster_ratio: float = 0.05,
                 n_neighbors: int = 3,
                 random_state: int = 42):
        
        self.model_name = model_name
        self.min_cluster_size = min_cluster_size
        self.auto_cluster_ratio = auto_cluster_ratio
        self.n_neighbors = n_neighbors
        self.random_state = random_state
        
        # Загрузка модели и токенизатора
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name, add_pooling_layer=False)
        
        # Подготовка стоп-слов
        self.russian_stopwords = stopwords.words('russian') + ['это', 'весь', 'который']
        self.morph = MorphAnalyzer()
        
        # Перенос модели на GPU при наличии
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.model.to(self.device)
    
    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Генерация эмбеддингов для списка текстов
        
        Аргументы:
        texts (List[str]): Список текстов для обработки
        
        Возвращает:
        np.ndarray: Массив эмбеддингов размерностью (n_texts, embedding_size)
        """
        inputs = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=64,
            return_tensors="pt"
        ).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Используем [CLS]-токен как репрезентацию предложения
        embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
        return embeddings
    
    def lemmatize(self, text: str) -> str:
        """
        Лемматизация и очистка текста
        
        Аргументы:
        text (str): Исходный текст
        
        Возвращает:
        str: Очищенный и лемматизированный текст
        """
        text = re.sub(r'[^\w\s]', ' ', text)
        words = text.lower().split()
        cleaned = [self.morph.parse(word)[0].normal_form for word in words 
                  if word not in self.russian_stopwords and len(word) > 2]
        return " ".join(cleaned)
    
    def calculate_adaptive_min_cluster_size(self, n_comments: int) -> int:
        """
        Автоматический расчет min_cluster_size в зависимости от количества комментариев
        
        Аргументы:
        n_comments (int): Количество комментариев
        
        Возвращает:
        int: Оптимальное значение min_cluster_size
        """
        if isinstance(self.min_cluster_size, int):
            return self.min_cluster_size
        
        # Автоматический расчет
        base_size = max(2, int(n_comments * self.auto_cluster_ratio))
        
        # Ограничения для разных объемов данных
        if n_comments < 10:

            return max(2, base_size)
        elif n_comments < 50:
            return max(3, base_size)
        elif n_comments < 100:
            return max(5, base_size)
        else:
            return max(10, min(base_size, 20))
    
    def cluster_comments(self, comments: List[str]) -> Tuple[np.ndarray, dict]:
        """
        Основной метод кластеризации комментариев
        
        Аргументы:
        comments (List[str]): Список комментариев для кластеризации
        
        Возвращает:
        Tuple: (labels, cluster_data)
          - labels: Массив меток кластеров для каждого комментария
          - cluster_data: Словарь с данными по кластерам
        """
        # 1. Генерация эмбеддингов
        embeddings = self.get_embeddings(comments)
        
        # 2. Автоматический расчет параметров
        n_comments = len(comments)
        adaptive_min_cluster_size = self.calculate_adaptive_min_cluster_size(n_comments)
        n_components = min(5, n_comments - 1) if n_comments > 1 else 1
        
        # 3. Уменьшение размерности с помощью UMAP
        umap_reducer = umap.UMAP(
            n_components=n_components,
            n_neighbors=min(self.n_neighbors, n_comments - 1),
            min_dist=0.05,
            metric='cosine',
            random_state=self.random_state,
            spread=1.0
        )
        reduced_embeddings = umap_reducer.fit_transform(embeddings)
        
        # 4. Кластеризация HDBSCAN
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=adaptive_min_cluster_size,
            min_samples=max(1, adaptive_min_cluster_size // 2),
            metric='euclidean',
            cluster_selection_method='leaf',
            cluster_selection_epsilon=0.5,
            gen_min_span_tree=True
        )
        clusters = clusterer.fit(reduced_embeddings)
        labels = clusters.labels_
        
        # 5. Подготовка данных по кластерам
        cluster_data = {}
        for cluster_id in set(labels):
            cluster_indices = [i for i, lbl in enumerate(labels) if lbl == cluster_id]
            cluster_data[cluster_id] = {
                "sentences": [comments[i] for i in cluster_indices],
                "indices": cluster_indices
            }
        
        return labels, cluster_data
    
    def get_clusters(self, comments: List[str]) -> List[Dict[str, Union[List[str], List[str]]]]:
        """
        Основной метод для получения кластеров в требуемом формате
        
        Возвращает:
        List[Dict]: Список словарей, каждый содержит:
            - "keywords": список ключевых слов (List[str])
            - "comments": список комментариев (List[str])
        """
        if not comments:
            return []
            
        # 1. Выполняем кластеризацию
        labels, cluster_data = self.cluster_comments(comments)
        
        # 2. Список для результатов
        clusters_list = []
        
        # 3. Обработка каждого кластера (включая шум)
        for cluster_id, data in cluster_data.items():
            cluster_comments = data["sentences"]
            
            # Лемматизация текстов для анализа ключевых слов
            lemmatized_texts = [self.lemmatize(sent) for sent in cluster_comments]
            
            # Генерация ключевых слов
            keywords = []
            try:
                if len(lemmatized_texts) > 0:
                    tfidf = TfidfVectorizer(max_features=50)
                    tfidf_matrix = tfidf.fit_transform(lemmatized_texts)
                    feature_names = tfidf.get_feature_names_out()
                    
                    cluster_tfidf_scores = tfidf_matrix.sum(axis=0).A1
                    top_indices = cluster_tfidf_scores.argsort()[::-1][:5]
                    keywords = [feature_names[i] for i in top_indices]
            except Exception as e:
                # Если не удалось получить ключевые слова, используем пустой список
                keywords = []
            
            # Формируем результат для кластера
            cluster_dict = {
                "keywords": keywords,

                "comments": cluster_comments
            }
            
            clusters_list.append(cluster_dict)
        
        # 4. Сортируем кластеры по размеру (от большего к меньшему)
        clusters_list.sort(key=lambda x: len(x["comments"]), reverse=True)
        
        return clusters_list


comment_clustering_model = CommentClustering()
