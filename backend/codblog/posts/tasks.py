from celery import shared_task  # type: ignore
from django.contrib.auth import get_user_model
from .models import Notifications, Comment, Post
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()


@shared_task
def create_notifications(
    recipient_id, sender_id, notification_type, post_id=None, comment_id=None
):
    time.sleep(1)
    print("processing...")
    time.sleep(1)
    print("processing...")
    recipient = User.objects.get(id=recipient_id)
    sender = User.objects.get(id=sender_id)
    notification_data = {
        "recipient": recipient,
        "sender": sender,
        "notification_type": notification_type,
    }

    if post_id:
        notification_data["post"] = Post.objects.get(id=post_id)

    if comment_id:
        notification_data["comment"] = Comment.objects.get(id=comment_id)
    Notifications.objects.create(**notification_data)


@shared_task
def send_notification_count(recipient_id):
    try:
        count = Notifications.objects.filter(
            recipient=recipient_id, is_read=False
        ).count()

        channel_layer = get_channel_layer()
        group_name = f"user_{recipient_id}"

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_count_update",
                "event_type": "count_update",
                "count": count,
            },
        )

    except Exception as e:
        print(f"[CELERY] Failed to send unlike count to {recipient_id}: {e}")
