"""
ASGI config for codblog project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codblog.settings")

django.setup()

from posts.routing import websocket_urlpatterns


application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': SessionMiddlewareStack(
        AuthMiddlewareStack(
            URLRouter( 
                websocket_urlpatterns
            )
        )
    ),
})