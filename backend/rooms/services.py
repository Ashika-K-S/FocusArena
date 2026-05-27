from django.utils import timezone

from .models import (
    Room,
    RoomParticipant,
    Submission,
    FocusViolation,

)

from ai.services import (
    generate_contest_feedback,
    save_contest_feedback,
)


def finalize_room_contest(room):

    if room.status == "FINISHED":
        return

    room.status = "FINISHED"

    room.ended_at = timezone.now()

    room.save()

    participants = RoomParticipant.objects.filter(
        room=room
    ).order_by("-score")

    winner = participants.first()

    if winner:

        winner.is_winner = True

        winner.save()

        winner_score = winner.score

    else:

        winner_score = 0

    for participant in participants:
        solved_count = Submission.objects.filter(
            room=room,
            user=participant.user,
            status="CORRECT"
        ).values("challenge").distinct().count()
        wrong_submissions = Submission.objects.filter(
            room=room,
            user=participant.user,
            status="WRONG"
        ).count()
        warning_count = FocusViolation.objects.filter(
            room=room,
            user=participant.user
        ).count()
        feedback_data = {
            "username": participant.user.username,
            "score": participant.score,
            "solved":solved_count,
            "wrong_submissions":wrong_submissions,
            "warnings":warning_count,
            "winner_score": winner_score,
        }

        feedback = generate_contest_feedback(
            feedback_data
        )

        save_contest_feedback(
            participant.user,
            room,
            feedback
        )
from django.utils import timezone

from .models import (
    Room,
    RoomParticipant,
    Submission,
    FocusViolation,

)

from ai.services import (
    generate_contest_feedback,
    save_contest_feedback,
)


def finalize_room_contest(room):

    if room.status == "FINISHED":
        return

    room.status = "FINISHED"

    room.ended_at = timezone.now()

    room.save()

    participants = RoomParticipant.objects.filter(
        room=room
    ).order_by("-score")

    winner = participants.first()

    if winner:

        winner.is_winner = True

        winner.save()

        winner_score = winner.score

    else:

        winner_score = 0

    for participant in participants:
        solved_count = Submission.objects.filter(
            room=room,
            user=participant.user,
            status="CORRECT"
        ).values("challenge").distinct().count()
        wrong_submissions = Submission.objects.filter(
            room=room,
            user=participant.user,
            status="WRONG"
        ).count()
        warning_count = FocusViolation.objects.filter(
            room=room,
            user=participant.user
        ).count()
        feedback_data = {
            "username": participant.user.username,
            "score": participant.score,
            "solved":solved_count,
            "wrong_submissions":wrong_submissions,
            "warnings":warning_count,
            "winner_score": winner_score,
        }

        feedback = generate_contest_feedback(
            feedback_data
        )

        save_contest_feedback(
            participant.user,
            room,
            feedback
        )