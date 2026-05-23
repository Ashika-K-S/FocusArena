from django.urls import path
from .views import DashboardStatsView, ContestHistoryView, PerformanceAnalyticsView
urlpatterns = [
    path("stats/", DashboardStatsView.as_view()),
    path("history/", ContestHistoryView.as_view()),
    path("analytics/", PerformanceAnalyticsView.as_view()),
]
