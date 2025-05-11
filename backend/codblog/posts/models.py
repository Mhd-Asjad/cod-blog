from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import JSONField

user = get_user_model()
    
class Post(models.Model):
    author = models.ForeignKey(user , on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.JSONField(null=True, blank=True)
    like = models.IntegerField(default=0)
    dislike = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f'{self.author.username} - {self.title}'
    
class Comment(models.Model):
    post = models.ForeignKey(Post , on_delete=models.CASCADE , related_name='comments')
    user = models.ForeignKey(user , on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.post.title} - {self.comment[:11]}.....'

