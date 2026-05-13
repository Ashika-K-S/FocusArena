import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rooms.models import RoomParticipant, Submission, Room

def fix_scores():
    print("Starting score recalculation for all participants...")
    participants = RoomParticipant.objects.all()
    
    for p in participants:
        room = p.room
        user = p.user
        
        # Calculate points
        total_points = 0
        contest_challenges = room.contest_challenges.all()
        for cc in contest_challenges:
            if Submission.objects.filter(room=room, user=user, challenge=cc.challenge, status="CORRECT").exists():
                total_points += cc.points
        
        if p.score != total_points:
            print(f"Updating {user.username} in {room.room_code}: {p.score} -> {total_points}")
            p.score = total_points
            p.save()

    # Optional: Fix winners for finished rooms
    print("\nStarting winner determination for finished rooms...")
    finished_rooms = Room.objects.filter(status="FINISHED")
    for room in finished_rooms:
        participants = RoomParticipant.objects.filter(room=room)
        if not participants.exists():
            continue
            
        # Re-calculate leaderboard logic to find winner
        leaderboard = []
        for p in participants:
            total_points = p.score
            total_penalty_seconds = 0
            total_solve_time_seconds = 0
            
            contest_challenges = room.contest_challenges.all().order_by('order')
            for cc in contest_challenges:
                correct_sub = Submission.objects.filter(
                    room=room, user=p.user, challenge=cc.challenge, status="CORRECT"
                ).order_by("submitted_at").first()
                
                if correct_sub:
                    if room.started_at:
                        solve_time = (correct_sub.submitted_at - room.started_at).total_seconds()
                        total_solve_time_seconds += solve_time
                    
                    wrong_attempts = Submission.objects.filter(
                        room=room, user=p.user, challenge=cc.challenge,
                        status="WRONG", submitted_at__lt=correct_sub.submitted_at
                    ).count()
                    total_penalty_seconds += (wrong_attempts * 600)
            
            ranking_score = total_solve_time_seconds + total_penalty_seconds
            leaderboard.append({
                "participant": p,
                "total_points": total_points,
                "ranking_score": ranking_score
            })
            
        # Sort to find winner
        leaderboard.sort(key=lambda x: (-x["total_points"], x["ranking_score"]))
        
        if leaderboard:
            winner_p = leaderboard[0]["participant"]
            # Reset all winners in this room first
            RoomParticipant.objects.filter(room=room).update(is_winner=False)
            # Set the winner
            winner_p.is_winner = True
            winner_p.save()
            print(f"Winner for {room.room_code} set to {winner_p.user.username}")

    print("\nData fix complete!")

if __name__ == "__main__":
    fix_scores()
