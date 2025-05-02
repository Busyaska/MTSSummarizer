from django.urls import path
from .views import ArticleCreateView, ArticleDetailView, ArticleListView


urlpatterns = [
    path('v1/create/', ArticleCreateView.as_view(), name='create'),
    path('v1/<int:article_id>/', ArticleDetailView.as_view(), name='detail'),
    path('v1/list/', ArticleListView.as_view(), name='list')
]
