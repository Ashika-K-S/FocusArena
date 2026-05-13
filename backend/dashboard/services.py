from django.db.models import Sum
from django.contrib.auth import get_user_model
from rooms.models import RoomParticipant, Submission

User = get_user_model()

def get_dashboard_stats(user):
    total_contests = RoomParticipant.objects.filter(user=user).count()
    problems_solved = Submission.objects.filter(
        user=user, status="CORRECT"
    ).values("challenge").distinct().count()

    competitions_won = RoomParticipant.objects.filter(user=user, is_winner=True).count()
    
    # Calculate user's total points
    user_total_points = RoomParticipant.objects.filter(user=user).aggregate(total=Sum("score"))["total"] or 0
    
    # Correct global rank calculation using get_user_model()
    all_users_points = User.objects.annotate(
        grand_total=Sum("roomparticipant__score")
    ).filter(grand_total__gt=user_total_points).count()
    
    global_rank = all_users_points + 1

    return {
        "total_contests": total_contests,
        "problems_solved": problems_solved,
        "competitions_won": competitions_won,
        "total_points": user_total_points,
        "global_rank": global_rank,
    }

def get_contest_history(user):
    participations = RoomParticipant.objects.filter(user=user).select_related("room").order_by("-room__created_at")
    history = []
    for item in participations:
        history.append({
            "room_code": item.room.room_code,
            "score": item.score,
            "is_winner": item.is_winner,
            "status": item.room.status,
            "created_at": item.room.created_at,
        })
    return history

def get_performance_analytics(user):
    participations = RoomParticipant.objects.filter(user=user).select_related("room").order_by("room__created_at")
    analytics = []
    for item in participations:
        analytics.append({
            "contest": item.room.room_code,
            "points": item.score
        })
    return analytics