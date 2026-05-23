from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from accounts.permissions import IsAdmin
from rooms.models import Room, Submission, Challenge, TestCase, RoomParticipant
from rooms.serializers import ChallengeSerializer
class AdminUsersListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        users = User.objects.all().order_by("-date_joined")
        user_data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "date_joined": user.date_joined,
                "is_blocked": user.is_blocked,
            }
            for user in users
        ]
        return Response(user_data)
class AdminPlatformStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        total_users = User.objects.count()
        total_rooms = Room.objects.count()
        total_submissions = Submission.objects.count()
        for r in Room.objects.filter(status="ACTIVE"):
            r.check_and_update_status()
        active_rooms = Room.objects.filter(status="ACTIVE").count()
        correct_count = Submission.objects.filter(status="CORRECT").count()
        error_count = Submission.objects.exclude(status="CORRECT").count()
        top_users = (
            Submission.objects.values("user__username")
            .annotate(total=Count("id"))
            .order_by("-total")[:5]
        )
        return Response(
            {
                "total_users": total_users,
                "total_rooms": total_rooms,
                "total_submissions": total_submissions,
                "active_rooms": active_rooms,
                "verdict_distribution": {
                    "correct": correct_count,
                    "errors": error_count,
                },
                "top_users": top_users,
            }
        )
class ChallengeListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        challenges = Challenge.objects.all().order_by("-created_at")
        serializer = ChallengeSerializer(challenges, many=True)
        return Response(serializer.data)
class CreateChallengeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def post(self, request):
        serializer = ChallengeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
class UpdateChallengeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def put(self, request, pk):
        challenge = get_object_or_404(Challenge, id=pk)
        serializer = ChallengeSerializer(challenge, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
class DeleteChallengeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def delete(self, request, pk):
        challenge = get_object_or_404(Challenge, id=pk)
        challenge.delete()
        return Response({"message": "Challenge deleted successfully"})
class ChallengeTestCaseListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request, challenge_id):
        try:
            challenge = Challenge.objects.get(id=challenge_id)
        except Challenge.DoesNotExist:
            return Response({"error": "Challenge not found"}, status=404)
        testcases = challenge.test_cases.all()
        data = []
        for testcase in testcases:
            data.append(
                {
                    "id": testcase.id,
                    "input_data": testcase.input_data,
                    "expected_output": testcase.expected_output,
                    "is_hidden": testcase.is_hidden,
                }
            )
        return Response(data)
class AddTestCaseView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def post(self, request, challenge_id):
        try:
            challenge = Challenge.objects.get(id=challenge_id)
        except Challenge.DoesNotExist:
            return Response({"error": "Challenge not found"}, status=404)
        input_data = request.data.get("input_data")
        expected_output = request.data.get("expected_output")
        is_hidden = request.data.get("is_hidden", False)
        testcase = TestCase.objects.create(
            challenge=challenge,
            input_data=input_data,
            expected_output=expected_output,
            is_hidden=is_hidden,
        )
        return Response({"message": "Testcase added", "id": testcase.id})
class DeleteTestCaseView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def delete(self, request, testcase_id):
        try:
            testcase = TestCase.objects.get(id=testcase_id)
        except TestCase.DoesNotExist:
            return Response({"error": "Testcase not found"}, status=404)
        testcase.delete()
        return Response({"message": "Deleted successfully"})
class AdminRoomListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        rooms = Room.objects.all().order_by("-created_at")
        data = []
        for room in rooms:
            data.append(
                {
                    "id": room.id,
                    "room_code": room.room_code,
                    "status": room.status,
                    "participants_count": RoomParticipant.objects.filter(
                        room=room
                    ).count(),
                    "max_participants": room.max_participants,
                    "created_by": room.created_by.username,
                    "created_at": room.created_at,
                }
            )
        return Response(data)
class DeleteRoomView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def delete(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)
        room.delete()
        return Response({"message": "Room deleted successfully"})
from django.utils import timezone

class EndRoomView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, room_id):

        try:
            room = Room.objects.get(id=room_id)

        except Room.DoesNotExist:
            return Response(
                {"error": "Room not found"},
                status=404
            )

        room.status = "FINISHED"
        room.ended_at = timezone.now()

        room.save()

        return Response(
            {"message": "Room ended successfully"}
        )
class KickParticipantView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def delete(self, request, room_id, participant_id):
        try:
            participant = RoomParticipant.objects.get(
                id=participant_id, room_id=room_id
            )
        except RoomParticipant.DoesNotExist:
            return Response({"error": "Participant not found"}, status=404)
        participant.delete()
        return Response({"message": "Participant removed"})
class AdminRoomDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)
        participants = []
        for participant in room.participants.all():
            participants.append(
                {
                    "id": participant.id,
                    "username": participant.user.username,
                    "score": participant.score,
                    "is_winner": participant.is_winner,
                    "joined_at": participant.joined_at,
                }
            )
        submissions = []
        for submission in room.submissions.all().order_by("-submitted_at"):
            submissions.append(
                {
                    "username": submission.user.username,
                    "challenge": submission.challenge.title,
                    "status": submission.status,
                    "language": submission.language,
                    "submitted_at": submission.submitted_at,
                }
            )
        contest_challenges = []
        for contest in room.contest_challenges.all():
            contest_challenges.append(
                {
                    "title": contest.challenge.title,
                    "difficulty": contest.challenge.difficulty,
                    "points": contest.points,
                    "order": contest.order,
                }
            )
        data = {
            "room": {
                "id": room.id,
                "room_code": room.room_code,
                "status": room.status,
                "difficulty": room.difficulty,
                "time_limit_minutes": room.time_limit_minutes,
                "max_participants": room.max_participants,
                "created_by": room.created_by.username,
                "started_at": room.started_at,
                "ended_at": room.ended_at,
                "created_at": room.created_at,
            },
            "participants": participants,
            "submissions": submissions,
            "contest_challenges": contest_challenges,
        }
        return Response(data)
class AdminRoomSubmissionsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)
        submissions = []
        for submission in room.submissions.all().order_by("-submitted_at"):
            submissions.append(
                {
                    "id": submission.id,
                    "username": submission.user.username,
                    "challenge": submission.challenge.title,
                    "room_code": room.room_code,
                    "status": submission.status,
                    "language": submission.language,
                    "submitted_at": submission.submitted_at,
                }
            )
        return Response(submissions)
class AdminAllSubmissionsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        submissions = Submission.objects.select_related(
            "user", "challenge", "room"
        ).order_by("-submitted_at")
        data = []
        for submission in submissions:
            data.append(
                {
                    "id": submission.id,
                    "username": submission.user.username,
                    "challenge": submission.challenge.title,
                    "room_code": (
                        submission.room.room_code if submission.room else "N/A"
                    ),
                    "status": submission.status,
                    "language": submission.language,
                    "submitted_at": submission.submitted_at,
                }
            )
        return Response(data)
class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        if user == request.user:
            return Response({"error": "You cannot block yourself"}, status=400)
        if user.role == "ADMIN":
            return Response({"error": "Cannot block another admin"}, status=400)
        user.is_blocked = True
        user.save()
        return Response({"message": "User blocked successfully"})
class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        user.is_blocked = False
        user.save()
        return Response({"message": "User unblocked successfully"})
