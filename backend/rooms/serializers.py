from rest_framework import serializers
from .models import Room, RoomParticipant, Challenge

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = "__all__"

class CreateRoomSerializer(serializers.Serializer):
    difficulty = serializers.ChoiceField(choices=['EASY', 'MEDIUM', 'HARD'])
    time_limit = serializers.IntegerField()

class JoinRoomSerializer(serializers.Serializer):
    room_code = serializers.CharField()

class RoomParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = RoomParticipant
        fields = ['username']

class RoomSerializer(serializers.ModelSerializer):
    creator = serializers.CharField(source='created_by.username', read_only=True)
    participants = serializers.SerializerMethodField()
    problems = serializers.SerializerMethodField()
    time_limit = serializers.IntegerField(source='time_limit_minutes', read_only=True)

    class Meta:
        model = Room
        fields = [
            'room_code', 'creator', 'difficulty', 'time_limit',
            'status', 'participants', 'problems', 'created_at', 'started_at'
        ]

    def get_participants(self, obj):
        participants = RoomParticipant.objects.filter(room=obj)
        return [p.user.username for p in participants]

    def get_problems(self, obj):
        contest_challenges = obj.contest_challenges.all().order_by('order')
        return [
            {
                "id": cc.challenge.id,
                "title": cc.challenge.title,
                "description": cc.challenge.description,
                "difficulty": cc.challenge.difficulty,
                "points": cc.points,
                "starter_code": cc.challenge.starter_code
            }
            for cc in contest_challenges
        ]