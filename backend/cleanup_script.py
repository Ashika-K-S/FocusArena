from rooms.models import Room, RoomParticipant, Submission
from django.db.models import Sum

# 1. Delete finished rooms with 0 points (broken test data)
rooms_to_delete = Room.objects.annotate(total_room_score=Sum('participants__score')).filter(status='FINISHED', total_room_score=0)
print(f"Deleting {rooms_to_delete.count()} broken rooms...")
rooms_to_delete.delete()

# 2. Recalculate scores for all remaining participations
participants = RoomParticipant.objects.all()
print(f"Recalculating scores for {participants.count()} participations...")
for p in participants:
    total_points = 0
    contest_challenges = p.room.contest_challenges.all()
    for cc in contest_challenges:
        if Submission.objects.filter(room=p.room, user=p.user, challenge=cc.challenge, status='CORRECT').exists():
            total_points += cc.points
    
    if p.score != total_points:
        p.score = total_points
        p.save()

print("Recalculation complete.")
