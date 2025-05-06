from rest_framework import serializers
from .models import Article


class ArticleDataBaseSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Article
        fields = ('url', 'title', 'article_summary', 'comments_summary')
        read_only_fields = ('title', 'article_summary', 'comments_summary')

    def create(self, validated_data):
        url = validated_data['url']
        user = validated_data['user']
        title = url.split('/')[-2]
        summary = f'{title} - {url}'
        return Article.objects.create(url=url, title=title,
                                      article_summary=summary, comments_summary='comments', user=user)
    
    def validate_url(self, value):
        if 'habr.com' not in value:
            raise serializers.ValidationError('This is not habr article.')
        return value


class ArticleSerialiser(serializers.Serializer):
    url = serializers.URLField(help_text='Ссылка на статью')
    title = serializers.CharField(required=False, help_text='Название статьи')
    article_summary = serializers.CharField(required=False, help_text='Резюме статьи')
    comments_summary = serializers.CharField(required=False, help_text='Резюме комментариев')

    def create(self, validated_data):
        url = validated_data['url']
        title = url.split('/')[-2]
        summary = f'{title} - {url}'
        obj = {'url': url,
               'title': title,
               'article_summary': summary,
               'comments_summary': 'comments'}
        return obj
    
    def validate_url(self, value):
        if 'habr.com' not in value:
            raise serializers.ValidationError('This is not habr article.')
        return value


class ArticleListSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Article
        fields = ('id', 'title', 'created_at')
        read_only_feilds = ('id', 'title', 'created_at')


class ArticleLatestSerializer(serializers.Serializer):
    title = serializers.CharField(help_text='Название статьи')
    publish_time = serializers.CharField(help_text='Время прошедшее с публикации статьи')
    url = serializers.URLField(help_text='Сслыка на статью')
