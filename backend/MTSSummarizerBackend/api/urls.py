from django.urls import path
from .views import (ArticleCreateView, ArticleDetailView,
                    ArticleListView, ArticleLatestListView)


urlpatterns = [
    path('v1/create/', ArticleCreateView.as_view(), name='create'),
    path('v1/article/<int:article_id>/', ArticleDetailView.as_view(), name='detail'),
    path('v1/list/', ArticleListView.as_view(), name='list'),
    path('v1/latest/', ArticleLatestListView.as_view(), name='latest')
]
