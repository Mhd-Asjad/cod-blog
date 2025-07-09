from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class  NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'
        if await self.is_valid_user() :
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            print(f'connection wass success full on group : {self.user_group_name}')
            await self.accept()           
        else :
            await self.close()
            
    async def disconnect(self, close_code):
        
        print(f'websocket connection closed with code : {close_code}')
        try:

            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
        except Exception as e :
            print(f"Error during disconnect: {str(e)}")
     
    async def send_notification(self, event):
        print(f"Websocker Consumer received: {event}")
        await self.send(text_data=json.dumps({
            'type': event.get('event_type'),
            'message': event.get('message'),
            'unread_count': event.get('unread_count'),
        }))
        
    async def send_unfollow_notification(self, event):
        await self.send(text_data=json.dumps({
            "type": event.get('event_type'),
            "notification": event["notification"],
            'unread_count': event.get('unread_count' , 0)
        }))
            
    async def send_count_update(self, event):
        await self.send(text_data=json.dumps({
            "type": event.get('event_type', 'count_update'),
            "unread_count": event.get('unread_count', 0)
        }))

    @database_sync_to_async
    def is_valid_user(self):
        try :
            return User.objects.filter(id=self.user_id).exists()
        except:
            return False