from django.contrib import admin

from .models import (
    Challenge,
    TestCase,
    Room,
    RoomParticipant,
    Submission,
    ContestChallenge
)


# =========================
# TEST CASE INLINE
# =========================

class TestCaseInline(admin.TabularInline):

    model = TestCase
    extra = 1


# =========================
# CONTEST CHALLENGE INLINE
# =========================

class ContestChallengeInline(admin.TabularInline):

    model = ContestChallenge
    extra = 1


# =========================
# CHALLENGE ADMIN
# =========================

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "difficulty",
        "language",
        "created_at"
    )

    search_fields = (
        "title",
        "difficulty"
    )

    list_filter = (
        "difficulty",
        "language"
    )

    inlines = [TestCaseInline]


# =========================
# ROOM ADMIN
# =========================

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    list_display = (
        "room_code",
        "difficulty",
        "status",
        "created_by",
        "created_at"
    )

    list_filter = (
        "status",
        "difficulty"
    )

    search_fields = (
        "room_code",
        "created_by__username"
    )

    inlines = [ContestChallengeInline]


# =========================
# ROOM PARTICIPANT ADMIN
# =========================

@admin.register(RoomParticipant)
class RoomParticipantAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "room",
        "score",
        "is_winner"
    )

    list_filter = (
        "is_winner",
    )


# =========================
# SUBMISSION ADMIN
# =========================

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "challenge",
        "status",
        "submitted_at"
    )

    list_filter = (
        "status",
        "language"
    )

    search_fields = (
        "user__username",
        "challenge__title"
    )


# =========================
# CONTEST CHALLENGE ADMIN
# =========================

@admin.register(ContestChallenge)
class ContestChallengeAdmin(admin.ModelAdmin):

    list_display = (
        "room",
        "challenge",
        "order",
        "points"
    )

    list_filter = (
        "room",
    )

    ordering = (
        "room",
        "order"
    )