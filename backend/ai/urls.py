from django.urls import path
from .views import UserContestFeedbackView

urlpatterns = [
    path(
        "feedback/<int:room_id>/",
        UserContestFeedbackView.as_view()
    ),
]