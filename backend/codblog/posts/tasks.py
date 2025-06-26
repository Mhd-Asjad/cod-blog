from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Notifications , Comment , Post
import time


User = get_user_model()

@shared_task
def create_notifications(recipient_id , sender_id , notification_type , post_id=None,
    comment_id=None):
    time.sleep(1)
    print('processing...')
    time.sleep(1)
    print('processing...')
    recipient = User.objects.get(id=recipient_id)
    sender = User.objects.get(id=sender_id)
    notification_data = {
        'recipient' : recipient,
        'sender' : sender ,
        'notification_type' : notification_type,
    }
    
    if post_id : 
        notification_data['post'] = Post.objects.get(id=post_id)
        
    if comment_id : 
        notification_data['comment'] = Comment.objects.get(id=comment_id)
    Notifications.objects.create(**notification_data)