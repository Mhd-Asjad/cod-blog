from django.db.models.signals import post_save , m2m_changed , post_delete
from django.dispatch import receiver
from .models import Comment , Follow , Post , Notifications
from .tasks import create_notifications
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save , sender=Comment)
def notify_on_comment(sender , instance , created , **kwargs):
    if created:
        print('comment triggeredd....')
        # not let post user get notifications  
        if instance.user != instance.post.author :
            create_notifications.delay(
                recipient_id = instance.post.author.id,
                sender_id = instance.user.id,
                notification_type = 'comment',
                post_id = instance.post.id,
                comment_id = instance.id
            )
            
@receiver(post_save  , sender=Follow)
def notify_on_follow(sender , instance , created , **kwargs):
    if created:
        
        Notifications.objects.create(
            recipient = instance.following,
            sender = instance.follower,
            notification_type = 'follow'
        )
        print(f"✅ Notification created: {instance.follower} followed {instance.following}")

@receiver(post_delete ,  sender=Follow)
def remove_follow_notification(sender , instance , **kwargs):
    deleted , _ = Notifications.objects.filter(
        recipient=instance.following,
        sender=instance.follower,
        notification_type='follow'
    ).delete()
    if deleted:
        print(f'Notification deleted : {instance.follower.username} unfollowed {instance.following}')
    
        
@receiver(m2m_changed , sender=Post.liked_by.through)
def notify_on_like(sender , instance , action , pk_set ,  **kwargs):
    print('post likes has been createdd')
    print(f' action trigged : {action}' )
    if action == 'post_add' :
        for user_id in pk_set :
            user = User.objects.get(id=user_id)
            exists = Notifications.objects.filter(
                recipient=instance.author,
                sender=user,
                notification_type='like',
                post=instance
            ).exists()
            
            if not exists and instance.author != user :
                print('like is created')
                Notifications.objects.create(
                    recipient_id = instance.author.id,
                    sender_id = user.id ,
                    notification_type = 'like',
                    post = instance
                )
                
    if action == 'post_remove' : 
        for user_id in pk_set:
            user = User.objects.get(id=user_id)
            deleted , _ = Notifications.objects.filter(
                recipient=instance.author,
                sender=user,
                notification_type='like',
                post=instance
            ).delete()
