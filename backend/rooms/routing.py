from django.urls import re_path
from .consumers import LeaderboardConsumer, AdminSubmissionConsumer, AdminViolationConsumer,
websocket_urlpatterns = [
    re_path(r"ws/rooms/(?P<room_code>\w+)/$", LeaderboardConsumer.as_asgi()),
    re_path(r"ws/admin/submissions/$", AdminSubmissionConsumer.as_asgi()),
        re_path(
        r"ws/admin/violations/$",
        AdminViolationConsumer.as_asgi(),
    ),

]
