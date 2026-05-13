from django.urls import re_path

from .consumers import (
    LeaderboardConsumer
)

websocket_urlpatterns = [

    re_path(

        r'ws/rooms/(?P<room_code>\w+)/$',

        LeaderboardConsumer.as_asgi()
    ),
]