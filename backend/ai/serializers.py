from rest_framework import serializers
from .models import ContestFeedback


class ContestFeedbackSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ContestFeedback

        fields = "__all__"