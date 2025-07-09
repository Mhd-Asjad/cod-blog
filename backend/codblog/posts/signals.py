from django.db.models.signals import post_save, m2m_changed, post_delete
from django.dispatch import receiver
from .models import Comment, Follow, Post, Notifications
from .tasks import create_notifications, send_notification_count
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()


@receiver(post_save, sender=Comment)
def notify_on_comment(sender, instance, created, **kwargs):
    if created:
        print("comment triggeredd....")
        # not let post user get notifications
        if instance.user != instance.post.author:
            Notifications.objects.create(
                recipient_id=instance.post.author.id,
                sender=instance.user,
                notification_type="comment",
                post_id=instance.post.id,
                comment_id=instance.id,
            )
            count = Notifications.objects.filter(recipient=instance.post.author , is_read=False).count()
            channel_layer = get_channel_layer()
            
            async_to_sync(channel_layer.group_send)(
                f'user_{instance.post.author.id}',
                {
                    "type" : "send_notification",
                    "event_type" : "comment_notification",
                    "message" : f"you have new comment on {instance.post.title[:11]}",
                    "unread_count" : count
                }
            )


@receiver(post_save, sender=Follow)
def notify_on_follow(sender, instance, created, **kwargs):
    if created:

        Notifications.objects.create(
            recipient=instance.following,
            sender=instance.follower,
            notification_type="follow",
        )
        print(
            f"✅ Notification created: {instance.follower} followed {instance.following}"
        )
        channel_layers = get_channel_layer()
        count = Notifications.objects.filter(
            recipient=instance.following, is_read=False
        ).count()

        async_to_sync(channel_layers.group_send)(
            f"user_{instance.following.id}",
            {
                "type": "send_notification",
                "event_type": "follow_notification",
                "message": f"{instance.following.username} started following you.",
                "unread_count": count,
            },
        )

@receiver(post_delete, sender=Follow)
def remove_follow_notification(sender, instance, **kwargs):

    recipient_user = instance.following

    deleted, _ = Notifications.objects.filter(
        recipient=instance.following,
        sender=instance.follower,
        notification_type="follow",
    ).delete()

    channel_layers = get_channel_layer()
    count = Notifications.objects.filter(
        recipient=instance.following, is_read=False
    ).count()

    print("🔁 Sending unfollow notification...")

    async_to_sync(channel_layers.group_send)(
        f"user_{recipient_user.id}",  # Notify the one who got unfollowed
        {
            "type": "send_count_update",
            "event_type": "unfollow_notification",
            "unread_count": count,
        },
    )
    if deleted:
        print(
            f"Notification deleted : {instance.follower.username} unfollowed {instance.following}"
        )


@receiver(m2m_changed, sender=Post.liked_by.through)
def notify_on_like(sender, instance, action, pk_set, **kwargs):
    print(f"post action trigged : {action}")
    if action == "post_add":
        for user_id in pk_set:
            user = User.objects.get(id=user_id)
            exists = Notifications.objects.filter(
                recipient=instance.author,
                sender=user,
                notification_type="like",
                post=instance,
            ).exists()

            if not exists and instance.author != user:
                print("like is created")
                Notifications.objects.create(
                    recipient_id=instance.author.id,
                    sender_id=user.id,
                    notification_type="like",
                    post=instance,
                )
                print("Calling celery task with recipient:", instance.author.id)

                # create_notifications.delay(
                #     recipient_id = instance.author.id,
                #     sender_id = user.id ,
                #     notification_type = 'like',
                #     post_id = instance.id
                # )

                channel_layer = get_channel_layer()
                count = Notifications.objects.filter(
                    recipient=instance.author, is_read=False
                ).count()
                async_to_sync(channel_layer.group_send)(
                    f"user_{instance.author.id}",
                    {
                        "type": "send_notification",
                        "event_type": "like_notification",
                        "message": f"{user.username} liked your post {instance.title}",
                        "unread_count": count,
                    },
                )

    if action == "post_remove":
        for user_id in pk_set:
            user = User.objects.get(id=user_id)

            deleted, _ = Notifications.objects.filter(
                recipient=instance.author,
                sender=user,
                notification_type="like",
                post=instance,
            ).delete()

        recipient_id = instance.author.id
        count = Notifications.objects.filter(
            recipient=recipient_id, is_read=False
        ).count()
        channel_layer = get_channel_layer()

        group_name = f"user_{recipient_id}"
        print(f"unlike notification got updated : {group_name}")
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_count_update",
                "event_type": "count_update",
                "unread_count": count,
            },
        )