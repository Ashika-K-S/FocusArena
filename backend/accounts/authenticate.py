from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from django.core.cache import cache
import hashlib
from .models import UserSession
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get("access")
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        refresh_token = request.COOKIES.get("refresh")
        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            if hasattr(user, "password_changed_at") and user.password_changed_at:
                password_changed_ts = user.password_changed_at.timestamp()
                if validated_token.get("iat") < password_changed_ts:
                    return None
            if refresh_token:
                token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
                cache_key = f"session_active:{token_hash}"
                is_active = cache.get(cache_key)
                if is_active is None:
                    session = UserSession.objects.filter(
                        refresh_token=refresh_token, is_active=True
                    ).exists()
                    if session:
                        cache.set(cache_key, True, timeout=900)
                        is_active = True
                    else:
                        is_active = False
                if not is_active:
                    return None
            return user, validated_token
        except:
            return None
