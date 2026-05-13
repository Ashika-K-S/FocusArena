from django.db import models
from django.contrib.auth import get_user_model
import random
import string

User = get_user_model()


def generate_room_code():
    return ''.join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=6
        )
    )


class Challenge(models.Model):

    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]

    LANGUAGE_CHOICES = [
        ('PYTHON', 'Python'),
    ]

    title = models.CharField(max_length=255)

    description = models.TextField()

    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES
    )

    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        default='PYTHON'
    )

    starter_code = models.TextField(
        blank=True,
        null=True
    )

    function_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    time_limit_seconds = models.IntegerField(
        default=2
    )

    memory_limit_mb = models.IntegerField(
        default=128
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title


class TestCase(models.Model):

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='test_cases'
    )

    input_data = models.TextField()

    expected_output = models.TextField()

    is_hidden = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.challenge.title} TestCase"


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

    room_code = models.CharField(
        max_length=10,
        unique=True,
        default=generate_room_code
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_rooms'
    )

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES
    )

    time_limit_minutes = models.IntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='WAITING'
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    ended_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.room_code


class RoomParticipant(models.Model):

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='participants'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    score = models.IntegerField(
        default=0
    )

    is_winner = models.BooleanField(
        default=False
    )

    joined_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ['room', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.room.room_code}"


class Submission(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CORRECT", "Correct"),
        ("WRONG", "Wrong"),
        ("ERROR", "Error"),
    ]

    LANGUAGE_CHOICES = [
        ('PYTHON', 'Python'),
    ]

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='submissions'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE
    )

    code = models.TextField()

    language = models.CharField(
        max_length=30,
        choices=LANGUAGE_CHOICES,
        default='PYTHON'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    runtime = models.FloatField(
        null=True,
        blank=True
    )

    memory = models.IntegerField(
        null=True,
        blank=True
    )

    passed_testcases = models.IntegerField(
        default=0
    )

    total_testcases = models.IntegerField(
        default=0
    )

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.challenge.title}"
    

class ContestChallenge(models.Model):

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="contest_challenges"
    )

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE
    )

    order = models.IntegerField(default=1)

    points = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.room.room_code} - {self.challenge.title}"