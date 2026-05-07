from django.db import models
from django.contrib.auth import get_user_model
import random
import string

User = get_user_model()


def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Room(models.Model):
    STATUS_CHOICES = [
        ('WAITING', 'Waiting'),
        ('ACTIVE', 'Active'),
        ('FINISHED', 'Finished'),
    ]

    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]

    room_code = models.CharField(max_length=10, unique=True, default=generate_room_code)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')

    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    time_limit = models.IntegerField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WAITING')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.room_code


class RoomParticipant(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['room', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.room.room_code}"
