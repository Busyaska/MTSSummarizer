from rest_framework import serializers
from adrf.serializers import ModelSerializer, Serializer
from .models import Article
from .habr_parser import parser
from .task_queue import task_queue


class ArticleDataBaseSerializer(ModelSerializer):
    
    class Meta:
        model = Article
        fields = ('url', 'title', 'article_summary', 'comments_summary')
        read_only_fields = ('title', 'article_summary', 'comments_summary')

    async def acreate(self, validated_data):
        url = validated_data['url']
        user = validated_data['user']
        parsed_article, parsed_comments = await parser.parsing_article(url)
        article_title = parsed_article['title']
        article_text = parsed_article['text']
        comments_text = '\n'.join([f'Комментарий {i}: {parsed_comments[i]}' for i in range(len(parsed_comments))])
        article_summary, comments_summary = await task_queue.process_task(article_text, comments_text)
        return await Article.objects.acreate(url=url, title=article_title,
                                             article_summary=article_summary, 
                                             comments_summary=comments_summary, user=user)
    
    def validate_url(self, value):
        if 'habr.com' not in value or ('articles' not in value and 'news' not in value):
            raise serializers.ValidationError('This is not Habr article.')
        return value


class ArticleSerialiser(Serializer):
    url = serializers.URLField(help_text='Ссылка на статью')
    title = serializers.CharField(required=False, help_text='Название статьи')
    article_summary = serializers.CharField(required=False, help_text='Резюме статьи')
    comments_summary = serializers.CharField(required=False, help_text='Резюме комментариев')

    async def acreate(self, validated_data):
        url = validated_data['url']
        parsed_article, parsed_comments = await parser.parsing_article(url)
        article_title = parsed_article['title']
        article_text = parsed_article['text']
        comments_text = '\n'.join([f'Комментарий {i}: {parsed_comments[i]}' for i in range(len(parsed_comments))])
        article_summary, comments_summary = await task_queue.process_task(article_text, comments_text)
        return {"url": url,
               "title": article_title,
               "article_summary": article_summary,
               "comments_summary": comments_summary}
    
    def validate_url(self, value):
        if 'habr.com' not in value or ('articles' not in value and 'news' not in value):
            raise serializers.ValidationError('This is not Habr article.')
        return value


class ArticleListSerializer(ModelSerializer):
    
    class Meta:
        model = Article
        fields = ('id', 'title', 'created_at')
        read_only_feilds = ('id', 'title', 'created_at')


class ArticleLatestSerializer(Serializer):
    title = serializers.CharField(help_text='Название статьи')
    publish_time = serializers.CharField(help_text='Время прошедшее с публикации статьи')
    url = serializers.URLField(help_text='Сслыка на статью')


class QueueStatusSerializer(Serializer):
    is_available = serializers.BooleanField(help_text='Заполнена ли очередь')
