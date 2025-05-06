from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveDestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from .serializers import (ArticleDataBaseSerializer, ArticleSerialiser,
                          ArticleListSerializer, ArticleLatestSerializer)
from .models import Article
from .habr_parser import parser


class ArticleCreateView(CreateAPIView):
    queryset = Article.objects.all()
    permission_classes = (AllowAny,)

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return ArticleDataBaseSerializer
        return ArticleSerialiser
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        return super().perform_create(serializer)


class ArticleListView(ListAPIView):
    serializer_class = ArticleListSerializer
    pagination_class = PageNumberPagination
    filter_backends = (SearchFilter,)
    search_fields = ('title',)

    def get_queryset(self):
        return Article.objects.filter(user=self.request.user)
    

class ArticleDetailView(RetrieveDestroyAPIView):
    serializer_class = ArticleDataBaseSerializer
    lookup_url_kwarg = 'article_id'

    def get_object(self):
        return super().get_object()

    def get_queryset(self):
        return Article.objects.filter(user=self.request.user)


class ArticleLatestListView(ListAPIView):
    serializer_class = ArticleLatestSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return parser.get_latest_articles()
