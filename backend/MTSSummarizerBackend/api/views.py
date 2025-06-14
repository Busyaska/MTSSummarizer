from adrf.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from asgiref.sync import sync_to_async
from django.shortcuts import get_object_or_404, get_list_or_404
from .serializers import (ArticleDataBaseSerializer, ArticleSerialiser,
                          ArticleListSerializer, ArticleLatestSerializer)
from .models import Article
from .habr_parser import parser


class ArticleCreateView(APIView):
    permission_classes = (AllowAny,)

    async def post(self, request,  *args, **kwargs):
        is_authenticated = request.user.is_authenticated
        if is_authenticated:
            serializer_class = ArticleDataBaseSerializer
        else:
            serializer_class = ArticleSerialiser
        serializer = serializer_class(data=request.data)
        if serializer.is_valid():
            if is_authenticated:
                await serializer.asave(user=request.user)
            else:
                await serializer.asave()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ArticleListView(APIView):
    serializer_class = ArticleListSerializer
    pagination_class = PageNumberPagination
    filter_class = SearchFilter
    search_fields = ('title',)
    model = Article
    
    async def get(self, request,  *args, **kwargs):

        def get_queryset():
            queryset = self.model.objects.filter(user=request.user)
            len(queryset)
            return queryset
        
        def get_filtred_queryset(queryset):
            filter = self.filter_class()
            filtred_queryset = filter.filter_queryset(request, queryset, self)
            len(filtred_queryset)
            return filtred_queryset
        
        queryset = await sync_to_async(get_queryset)()
        article_objects = await sync_to_async(get_filtred_queryset)(queryset)
        serialized_articles = []
        for article in article_objects:
            serializer = self.serializer_class(article)
            serialized_articles.append(serializer.data)
        paginatior = PageNumberPagination()
        current_page = paginatior.paginate_queryset(serialized_articles, request)
        return paginatior.get_paginated_response(current_page)


class ArticleDetailView(APIView):
    serializer_class = ArticleDataBaseSerializer
    model = Article
    article_obj = None

    async def async_dispatch(self, request, *args, **kwargs):
        self.article_obj = await sync_to_async(get_object_or_404)(klass=self.model, pk=kwargs['article_id'])
        return await super().async_dispatch(request, *args, **kwargs)

    async def get(self, request,  *args, **kwargs):
        serializer = self.serializer_class(self.article_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    async def delete(self, request,  *args, **kwargs):
        await self.article_obj.adelete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ArticleLatestListView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ArticleLatestSerializer

    async def get(self, request, *args, **kwargs):
        articles = await parser.parsing_latest_articles()
        serializer = self.serializer_class(data=articles, many=True)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
