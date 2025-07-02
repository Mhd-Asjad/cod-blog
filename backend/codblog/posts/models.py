from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import JSONField
from accounts.models import *

user = get_user_model()

class Post(models.Model):
    author = models.ForeignKey(user, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.JSONField(null=True, blank=True)
    like = models.IntegerField(default=0)
    liked_by = models.ManyToManyField(user, related_name="liked_posts", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"{self.author.username} - {self.title}"


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(user, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"{self.post.title} - {self.comment[:11]}....."

class Follow(models.Model):    
    follower = models.ForeignKey(user, related_name="following", on_delete=models.CASCADE) # this field will stores the user who clicked "follow" (the one initiating the action)
    following = models.ForeignKey(user, related_name="followers", on_delete=models.CASCADE) # Stores the user who is being followed (the one receiving the follow)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("follower", "following")

    def _str_(self):
        return f"{self.follower.username} follows {self.following.username}"
    
class Notifications(models.Model):
    NOTIFICACTION_TYPES = (
        ('comment' , 'comment'),
        ('like' , 'Like'),
        ('follow' , 'Follow')
    )

    recipient = models.ForeignKey(CustomUser , on_delete=models.CASCADE , related_name='notifications')
    sender = models.ForeignKey(CustomUser,on_delete=models.CASCADE , related_name='sent_notifications')
    notification_type = models.CharField(max_length=20 , choices=NOTIFICACTION_TYPES)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        notification = f'notification for {self.post.title}' if self.notification_type == 'like' and self.post else 'notification' 
        return f"{self.sender.username} {self.notification_type} {notification}"