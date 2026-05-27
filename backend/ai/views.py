from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ContestFeedback
from .serializers import ContestFeedbackSerializer


class UserContestFeedbackView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):

        feedback = ContestFeedback.objects.filter(
            user=request.user,
            room_id=room_id
        ).first()

        if not feedback:

            return Response({
                "message": "No feedback found"
            }, status=404)

        return Response({
            "feedback": feedback.feedback
        })