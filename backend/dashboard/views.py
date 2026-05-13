from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import get_dashboard_stats, get_contest_history, get_performance_analytics

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = get_dashboard_stats(request.user)
        return Response(data)

class ContestHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = get_contest_history(request.user)
        return Response(data)

class PerformanceAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = get_performance_analytics(request.user)
        return Response(data)
