from django.urls import path
from .views import (
    CreateRoomView,
    JoinRoomView,
    RoomDetailView
)

urlpatterns = [
    path('create/', CreateRoomView.as_view()),
    path('join/', JoinRoomView.as_view()),
    path('<str:room_code>/', RoomDetailView.as_view()),
]