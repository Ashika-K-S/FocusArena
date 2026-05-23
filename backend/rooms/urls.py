from django.urls import path
from .views import (
    CreateRoomView,
    JoinRoomView,
    RoomDetailView,
    StartRoomView,
    SubmitSolutionView,
    RunCodeView,
    SubmissionListView,
    LeaderboardView,
    TabSwitchWarningView,
)
urlpatterns = [
    path("create/", CreateRoomView.as_view()),
    path("join/", JoinRoomView.as_view()),
    path("<str:room_code>/", RoomDetailView.as_view()),
    path("<str:room_code>/start/", StartRoomView.as_view()),
    path("<str:room_code>/submit/", SubmitSolutionView.as_view()),
    path("<str:room_code>/run/", RunCodeView.as_view()),
    path("<str:room_code>/submissions/", SubmissionListView.as_view()),
    path("<str:room_code>/leaderboard/", LeaderboardView.as_view()),
    path("rooms/tab-warning/", TabSwitchWarningView.as_view()),
]
