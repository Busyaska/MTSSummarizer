from rest_framework import serializers
from django.utils import timezone
from .models import Article


class ArticleDataBaseSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Article
        fields = ('url', 'title', 'summary', 'created_at')
        read_only_fields = ('title', 'summary', 'created_at')

    def create(self, validated_data):
        url = validated_data['url']
        user = validated_data['user']
        title = url.split('/')[-2]
        summary = f'{title} - {url}'
        return Article.objects.create(url=url, title=title,
                                      summary=summary, user=user)
    
    def validate_url(self, value):
        if 'habr.com' not in value:
            raise serializers.ValidationError('This is not habr article.')
        return value


class ArticleSerialiser(serializers.Serializer):
    url = serializers.URLField()
    title = serializers.CharField(required=False)
    summary = serializers.CharField(required=False)
    created_at = serializers.DateTimeField(required=False)

    def create(self, validated_data):
        url = validated_data['url']
        title = url.split('/')[-2]
        summary = f'{title} - {url}'
        created_at = timezone.now()
        obj = {'url': url,
               'title': title,
               'summary': summary,
               'created_at': created_at}
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
    title = serializers.CharField()
    publish_time = serializers.CharField()
    url = serializers.URLField()
