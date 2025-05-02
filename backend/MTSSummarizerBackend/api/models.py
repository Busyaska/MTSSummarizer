from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()


class Article(models.Model):
    url = models.URLField('Ссылка на статью', max_length=128)
    title = models.CharField('Название статьи', max_length=128)
    summary = models.TextField('Пересказ статьи')
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='articles', verbose_name='Пользователь')
    created_at = models.DateTimeField('Дата и время создания', auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'
