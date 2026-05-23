from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta
import hashlib
class User(AbstractUser):
    ROLE_CHOICES = (
        ("USER", "User"),
        ("ADMIN", "Admin"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="USER")
    password_changed_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_blocked = models.BooleanField(default=False)
    def save(self, *args, **kwargs):
        if self.pk:
            old_user = User.objects.get(pk=self.pk)
            if old_user.role != self.role:
                UserSession.objects.filter(user=self).update(is_active=False)
                from django.core.cache import cache
                sessions = UserSession.objects.filter(user=self)
                for session in sessions:
                    if session.refresh_token:
                        token_hash = hashlib.sha256(
                            session.refresh_token.encode()
                        ).hexdigest()
                        cache.delete(f"session_active:{token_hash}")
        super().save(*args, **kwargs)
    def __str__(self):
        return self.username
class OTP(models.Model):
    email = models.EmailField()
    code_hash = models.CharField(max_length=128)
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    def set_code(self, raw_code):
        self.code_hash = hashlib.sha256(raw_code.encode()).hexdigest()
    def verify_code(self, raw_code):
        hashed = hashlib.sha256(raw_code.encode()).hexdigest()
        if not self.is_valid():
            return False
        if self.attempts >= 5:
            return False
        self.attempts += 1
        self.save()
        if self.code_hash == hashed:
            self.is_verified = True
            self.save()
            return True
        return False
    def is_valid(self):
        return (timezone.now() - self.created_at) < timedelta(minutes=5)
    def __str__(self):
        return f"{self.email} - OTP"
class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    session_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    refresh_token = models.TextField()
    device = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.user.username} | {self.device} | Active: {self.is_active}"
class AuthLog(models.Model):
    EVENT_CHOICES = (
        ("LOGIN", "Login"),
        ("LOGOUT", "Logout"),
        ("PASSWORD_RESET", "Password Reset"),
        ("FAILED_LOGIN", "Failed Login"),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.CharField(max_length=50, choices=EVENT_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.user.username} - {self.event}"
