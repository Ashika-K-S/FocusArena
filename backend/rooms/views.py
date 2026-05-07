from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Room, RoomParticipant
from .serializers import (
    RoomSerializer,
    CreateRoomSerializer,
    JoinRoomSerializer
)


class CreateRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateRoomSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        room = Room.objects.create(
            created_by=request.user,
            difficulty=serializer.validated_data['difficulty'],
            time_limit=serializer.validated_data['time_limit']
        )

        RoomParticipant.objects.create(
            room=room,
            user=request.user
        )

        return Response({
            'message': 'Room created successfully',
            'room_code': room.room_code
        }, status=201)


class JoinRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = JoinRoomSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        room_code = serializer.validated_data['room_code']

        try:
            room = Room.objects.get(room_code=room_code)
        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=404)

        if room.status != 'WAITING':
            return Response({'error': 'Competition already started'}, status=400)

        already_joined = RoomParticipant.objects.filter(
            room=room,
            user=request.user
        ).exists()

        if already_joined:
            return Response({'message': 'Already joined'})

        RoomParticipant.objects.create(
            room=room,
            user=request.user
        )

        return Response({'message': 'Joined room successfully'})
    
class RoomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_code):
        try:
            room = Room.objects.get(room_code=room_code)
        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=404)

        serializer = RoomSerializer(room)
        return Response(serializer.data)