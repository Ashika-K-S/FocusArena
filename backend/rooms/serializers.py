from rest_framework import serializers
from .models import Room,RoomParticipant


class RoomSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    creator = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Room
        fields = [
            'room_code',
            'creator',
            'difficulty',
            'time_limit',
            'status',
            'participants',
            'created_at'
        ]

    def get_participants(self, obj):
        return [p.user.username for p in obj.participants.all()]


class CreateRoomSerializer(serializers.Serializer):
    difficulty = serializers.ChoiceField(choices=['EASY', 'MEDIUM', 'HARD'])
    time_limit = serializers.IntegerField(min_value=1)


class JoinRoomSerializer(serializers.Serializer):
    room_code = serializers.CharField()