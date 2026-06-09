from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from administration.permissions import IsAdmin

from .utils import execute_python_code

from .serializers import (
    RoomSerializer,
    CreateRoomSerializer,
    JoinRoomSerializer,
)

from .models import (
    Room,
    RoomParticipant,
    Challenge,
    Submission,
    ContestChallenge,
    FocusViolation,
)

from .services import finalize_room_contest

class CreateRoomView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = CreateRoomSerializer(data=request.data)

        if not serializer.is_valid():

            return Response(serializer.errors, status=400)

        available_challenges = list(
            Challenge.objects.filter(
                difficulty=serializer.validated_data["difficulty"]
            ).order_by("?")[:3]
        )

        if len(available_challenges) < 3:

            return Response(
                {
                    "error": f"Not enough {serializer.validated_data['difficulty']} challenges available. Please add challenges first."
                },
                status=400,
            )

        room = Room.objects.create(
            created_by=request.user,
            difficulty=serializer.validated_data["difficulty"],
            time_limit_minutes=serializer.validated_data["time_limit"],
        )

        for index, challenge in enumerate(available_challenges):

            ContestChallenge.objects.create(
                room=room,
                challenge=challenge,
                order=index + 1,
                points=(index + 1) * 100,
            )

        RoomParticipant.objects.create(
            room=room,
            user=request.user
        )

        return Response(
            {
                "message": "Room created successfully",
                "room_code": room.room_code,
            },
            status=201,
        )

class JoinRoomView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = JoinRoomSerializer(data=request.data)

        if not serializer.is_valid():

            return Response(serializer.errors, status=400)

        room_code = serializer.validated_data["room_code"]

        try:

            room = Room.objects.get(
                room_code=room_code
            )

        except Room.DoesNotExist:

            return Response(
                {"error": "Room not found"},
                status=404
            )

        if room.status != "WAITING":

            return Response(
                {"error": "Competition already started"},
                status=400
            )

        already_joined = RoomParticipant.objects.filter(
            room=room,
            user=request.user
        ).exists()

        if already_joined:

            return Response({
                "message": "Already joined"
            })

        RoomParticipant.objects.create(
            room=room,
            user=request.user
        )

        return Response({
            "message": "Joined room successfully"
        })


class RoomDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, room_code):

        try:

            room = Room.objects.get(
                room_code=room_code
            )

            if room.started_at:

                end_time = room.started_at + timezone.timedelta(
                    minutes=room.time_limit_minutes
                )

                if timezone.now() > end_time:

                    if room.status != "FINISHED":

                        finalize_room_contest(room)
            if room.status == "ACTIVE":

                total_possible = sum(
                    cc.points
                    for cc in room.contest_challenges.all()
                )

                if total_possible > 0:

                    winner = RoomParticipant.objects.filter(
                        room=room,
                        score__gte=total_possible
                    ).first()

                    if winner:
                        finalize_room_contest(room)

        except Room.DoesNotExist:

            return Response({
                "error": "Room not found"
            }, status=404)

        serializer = RoomSerializer(room)

        return Response(serializer.data)


class StartRoomView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, room_code):

        try:

            room = Room.objects.get(
                room_code=room_code
            )

        except Room.DoesNotExist:

            return Response({
                "error": "Room not found"
            }, status=404)

        if room.created_by != request.user:

            return Response({
                "error": "Only creator can start room"
            }, status=403)

        if room.status == "ACTIVE":

            return Response({
                "error": "Room already active"
            }, status=400)

        room.status = "ACTIVE"

        room.started_at = timezone.now()

        room.save()

        return Response({
            "message": "Room started successfully",
            "status": room.status
        })


class SubmitSolutionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, room_code):

        try:

            room = Room.objects.get(
                room_code=room_code
            )

        except Room.DoesNotExist:

            return Response({
                "error": "Room not found"
            }, status=404)

        if room.status != "ACTIVE":

            return Response({
                "error": "Room is not active"
            }, status=400)

        problem_id = request.data.get("problem_id")

        if not problem_id:

            return Response({
                "error": "problem_id is required"
            }, status=400)

        try:

            contest_problem = (
                room.contest_challenges
                .select_related("challenge")
                .get(challenge_id=problem_id)
            )

        except ContestChallenge.DoesNotExist:

            return Response({
                "error": "Problem not found in this room"
            }, status=404)

        challenge = contest_problem.challenge

        code = request.data.get("code")

        language = request.data.get("language")

        if not code:

            return Response({
                "error": "Code is required"
            }, status=400)

        if language != "python":

            return Response({
                "error": "Only python supported currently"
            }, status=400)

        already_solved = Submission.objects.filter(
            room=room,
            user=request.user,
            challenge=challenge,
            status="CORRECT"
        ).exists()

        if already_solved:

            return Response({
                "error": "Problem already solved"
            }, status=400)

        end_time = room.started_at + timezone.timedelta(
            minutes=room.time_limit_minutes
        )

        if timezone.now() > end_time:

            finalize_room_contest(room)

            return Response({
        "error": "Battle ended"
    }, status=400)

        test_cases = challenge.test_cases.all()

        execution_result = execute_python_code(
            code,
            test_cases
        )

        final_status = execution_result.get(
            "status",
            "ERROR"
        )

        submission = Submission.objects.create(
            room=room,
            user=request.user,
            challenge=challenge,
            code=code,
            language=language,
            status=final_status,
        )

        if final_status == "CORRECT":

            participant = RoomParticipant.objects.get(
                room=room,
                user=request.user
            )

            total_score = 0

            for cc in room.contest_challenges.all():

                if Submission.objects.filter(
                    room=room,
                    user=request.user,
                    challenge=cc.challenge,
                    status="CORRECT",
                ).exists():

                    total_score += cc.points

            participant.score = total_score

            participant.save()

            total_possible_points = sum(
                cc.points
                for cc in room.contest_challenges.all()
            )

            if total_score >= total_possible_points:

                finalize_room_contest(room)
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"room_{room.room_code}",
            {
                "type": "leaderboard_update"
            }
        )

        async_to_sync(channel_layer.group_send)(
            f"room_{room.room_code}",
            {
                "type": "submission_update",
                "submission": {
                    "username": submission.user.username,
                    "challenge": submission.challenge.title,
                    "status": submission.status,
                    "language": submission.language,
                    "submitted_at": (
                        submission.submitted_at.isoformat()
                        if submission.submitted_at
                        else None
                    ),
                },
            },
        )

        async_to_sync(channel_layer.group_send)(
            "admin_submissions",
            {
                "type": "submission_update",
                "data": {
                    "id": submission.id,
                    "username": submission.user.username,
                    "challenge": submission.challenge.title,
                    "room_code": submission.room.room_code,
                    "status": submission.status,
                    "language": submission.language,
                    "submitted_at": str(submission.submitted_at),
                },
            },
        )

        return Response(
            {
                "message": "Solution submitted",
                "submission_id": submission.id,
                "status": final_status,
                "results": execution_result.get(
                    "results",
                    []
                ),
            }
        )


class RunCodeView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, room_code):

        try:

            room = Room.objects.get(
                room_code=room_code
            )

        except Room.DoesNotExist:

            return Response({
                "error": "Room not found"
            }, status=404)

        problem_id = request.data.get("problem_id")

        if not problem_id:

            return Response({
                "error": "problem_id is required"
            }, status=400)

        try:

            contest_problem = (
                room.contest_challenges
                .select_related("challenge")
                .get(challenge_id=problem_id)
            )

        except ContestChallenge.DoesNotExist:

            return Response({
                "error": "Problem not found in this room"
            }, status=404)

        challenge = contest_problem.challenge

        code = request.data.get("code")

        if not code:

            return Response({
                "error": "Code is required"
            }, status=400)

        test_cases = challenge.test_cases.all()

        execution_result = execute_python_code(
            code,
            test_cases
        )

        return Response({
            "status": execution_result.get(
                "status",
                "ERROR"
            ),
            "results": execution_result.get(
                "results",
                []
            ),
        })


class SubmissionListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, room_code):

        submissions = Submission.objects.filter(
            room__room_code=room_code
        ).order_by("-submitted_at")

        data = []

        for submission in submissions:

            data.append({
                "user": submission.user.username,
                "challenge": submission.challenge.title,
                "status": submission.status,
                "language": submission.language,
                "submitted_at": submission.submitted_at,
            })

        return Response(data)


class LeaderboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, room_code):

        try:

            room = Room.objects.get(
                room_code=room_code
            )

        except Room.DoesNotExist:

            return Response({
                "error": "Room not found"
            }, status=404)

        participants = RoomParticipant.objects.filter(
            room=room
        ).select_related("user")

        contest_challenges = (
            room.contest_challenges.all()
            .order_by("order")
            .select_related("challenge")
        )

        leaderboard = []

        for participant in participants:

            solved_count = 0

            total_points = 0

            total_penalty_seconds = 0

            total_solve_time_seconds = 0

            problems_map = {}

            for index, contest_problem in enumerate(
                contest_challenges
            ):

                label = chr(65 + index)

                correct_sub = (
                    Submission.objects.filter(
                        room=room,
                        user=participant.user,
                        challenge=contest_problem.challenge,
                        status="CORRECT",
                    )
                    .order_by("submitted_at")
                    .first()
                )

                if correct_sub:

                    status = "CORRECT"

                    solved_count += 1

                    total_points += contest_problem.points

                    if room.started_at:

                        solve_time = (
                            correct_sub.submitted_at
                            - room.started_at
                        ).total_seconds()

                        total_solve_time_seconds += solve_time

                    wrong_attempts = Submission.objects.filter(
                        room=room,
                        user=participant.user,
                        challenge=contest_problem.challenge,
                        status="WRONG",
                        submitted_at__lt=correct_sub.submitted_at,
                    ).count()

                    total_penalty_seconds += (
                        wrong_attempts * 600
                    )

                else:

                    latest = (
                        Submission.objects.filter(
                            room=room,
                            user=participant.user,
                            challenge=contest_problem.challenge,
                        )
                        .order_by("-submitted_at")
                        .first()
                    )

                    status = (
                        latest.status
                        if latest
                        else "NOT_SOLVED"
                    )

                problems_map[label] = status

            # =========================
            # FOCUS VIOLATION SYSTEM
            # =========================

            warning_count = FocusViolation.objects.filter(
                user=participant.user,
                room=room
            ).count()

            warning_penalty = warning_count * 5

            final_score = max(
                total_points - warning_penalty,
                0
            )

            # =========================
            # DISQUALIFICATION SYSTEM
            # =========================

            is_disqualified = warning_count >= 5

            ranking_score = (
                total_solve_time_seconds
                + total_penalty_seconds
            )

            leaderboard.append({

                "username": participant.user.username,

                "solved_count": solved_count,

                "total_points": final_score,

                "original_points": total_points,

                "warning_count": warning_count,

                "warning_penalty": warning_penalty,

                "is_disqualified": is_disqualified,

                "penalty": int(
                    total_penalty_seconds / 60
                ),

                "ranking_score": ranking_score,

                "problems": problems_map,
            })

        leaderboard.sort(
            key=lambda x: (
                x["is_disqualified"],
                -x["total_points"],
                x["ranking_score"],
            )
        )

        return Response(leaderboard)


class TrackFocusViolationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        room_code = request.data.get("room_code")

        violation_type = request.data.get(
            "violation_type"
        )

        try:

            room = Room.objects.get(
                room_code=room_code
            )

        except Room.DoesNotExist:

            return Response({
                "error": "Room not found"
            }, status=404)

        FocusViolation.objects.create(
            user=request.user,
            room=room,
            violation_type=violation_type
        )

        warning_count = FocusViolation.objects.filter(
            user=request.user,
            room=room
        ).count()

        return Response({
            "warning_count": warning_count
        })


class AdminViolationMonitorView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get(self, request):

        violations = (
            FocusViolation.objects
            .select_related("user", "room")
            .order_by("-created_at")
        )

        data = []

        for violation in violations:

            warning_count = (
                FocusViolation.objects.filter(
                    user=violation.user,
                    room=violation.room
                ).count()
            )

            data.append({
                "username": violation.user.username,
                "room_code": violation.room.room_code,
                "violation_type": violation.violation_type,
                "warning_count": warning_count,
                "created_at": violation.created_at,
            })

        return Response(data)

