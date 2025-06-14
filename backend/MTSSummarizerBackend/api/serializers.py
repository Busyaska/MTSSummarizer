from rest_framework import serializers
from adrf.serializers import ModelSerializer, Serializer
from .models import Article


class ArticleDataBaseSerializer(ModelSerializer):
    
    class Meta:
        model = Article
        fields = ('url', 'title', 'article_summary', 'comments_summary')
        read_only_fields = ('title', 'article_summary', 'comments_summary')

    async def acreate(self, validated_data):
        url = validated_data['url']
        user = validated_data['user']
        title = url.split('/')[-2]
        summary = f'{title} - {url}'
        return await Article.objects.acreate(url=url, title=title,
                                             article_summary=summary, 
                                             comments_summary='comments', user=user)
    
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
        title = url.split('/')[-2]
        summary = f'{title} - {url}'
        return {'url': url,
               'title': title,
               'article_summary': summary,
               'comments_summary': 'comments'}
    
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
