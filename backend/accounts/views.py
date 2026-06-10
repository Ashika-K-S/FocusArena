from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
import random
from .models import OTP, User, UserSession, AuthLog
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from utils.email_service import send_block_email
from django.utils import timezone
UserModel = get_user_model()
def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]
    return request.META.get("REMOTE_ADDR")
class RegisterView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(ratelimit(key="ip", rate="5/m", block=True))
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=201)
        return Response(serializer.errors, status=400)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(
            {
                "message": "You are authenticated",
                "user": request.user.username,
                "role": request.user.role,
            }
        )
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    @method_decorator(ratelimit(key="ip", rate="5/m", block=True))
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code != 200:
            return response
        access = response.data.get("access")
        refresh = response.data.get("refresh")
        try:
            refresh_obj = RefreshToken(refresh)
            user_id = refresh_obj["user_id"]
            user = UserModel.objects.get(id=user_id)
            if user.is_blocked:
                return Response({
                    "error": "Your account has been blocked",
                    "reason": user.blocked_reason
                }, status=403)
        except Exception:
            return Response({"error": "Invalid token"}, status=401)
        UserSession.objects.create(
            user=user,
            refresh_token=refresh,
            device=request.META.get("HTTP_USER_AGENT", "Unknown"),
            ip_address=get_client_ip(request),
        )
        AuthLog.objects.create(
            user=user,
            event="LOGIN",
            ip_address=get_client_ip(request),
            device=request.META.get("HTTP_USER_AGENT", ""),
        )
        response.data["role"] = user.role
        response.data["username"] = user.username
        response.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        return response
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        refresh = request.COOKIES.get("refresh")
        if not refresh:
            return Response({"error": "No refresh token"}, status=401)
        session = UserSession.objects.filter(
            refresh_token=refresh, is_active=True
        ).first()
        if not session:
            return Response({"error": "Invalid session"}, status=401)
        try:
            token = RefreshToken(refresh)
            access = str(token.access_token)
            new_refresh = str(RefreshToken.for_user(session.user))
            session.refresh_token = new_refresh
            session.save()
            res = Response({"message": "Token refreshed"})
            res.set_cookie(
                key="access",
                value=access,
                httponly=True,
                secure=True,
                samesite="None",
                path="/",
            )
            res.set_cookie(
                key="refresh",
                value=new_refresh,
                httponly=True,
                secure=True,
                samesite="None",
                path="/",
            )
            return res
        except Exception:
            return Response({"error": "Invalid refresh token"}, status=401)
class LogoutView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(csrf_exempt)
    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh")
            if refresh_token:
                UserSession.objects.filter(refresh_token=refresh_token).update(
                    is_active=False
                )
        except:
            pass
        response = Response({"message": "Logged out successfully"}, status=200)
        response.delete_cookie("access", path="/")
        response.delete_cookie("refresh", path="/")
        return response
class LogoutAllView(APIView):
    permission_classes = [IsAuthenticated]
    @method_decorator(csrf_exempt)
    def post(self, request):
        try:
            UserSession.objects.filter(user=request.user).update(is_active=False)
        except Exception as e:
            pass
        response = Response({"message": "Logged out from all devices"}, status=200)
        response.delete_cookie("access", path="/")
        response.delete_cookie("refresh", path="/")
        return response
class SessionListView(APIView):
    permission_classes = [IsAuthenticated]
    @method_decorator(csrf_exempt)
    def get(self, request):
        try:
            sessions = UserSession.objects.filter(
                user=request.user, is_active=True
            ).order_by("-last_active")
            data = []
            current_refresh = request.COOKIES.get("refresh")
            for s in sessions:
                data.append(
                    {
                        "device": s.device or "Unknown",
                        "ip": s.ip_address,
                        "created_at": s.created_at,
                        "current": s.refresh_token == current_refresh,
                    }
                )
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
class SendOTPView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(ratelimit(key="ip", rate="3/m", block=True))
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)
        if not User.objects.filter(email=email).exists():
            return Response({"error": "User not found"}, status=404)
        code = str(random.randint(100000, 999999))
        OTP.objects.filter(email=email).delete()
        otp = OTP(email=email)
        otp.set_code(code)
        otp.save()
        send_mail(
            subject="Your OTP Code",
            message=f"Your OTP is: {code}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({"message": "OTP sent to email"})
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(ratelimit(key="ip", rate="5/m", block=True))
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        if not email or not code:
            return Response({"error": "Email and code are required"}, status=400)
        try:
            otp = OTP.objects.filter(email=email).latest("created_at")
        except OTP.DoesNotExist:
            return Response({"error": "OTP not found"}, status=404)
        if otp.is_verified:
            return Response({"message": "OTP already verified"}, status=200)
        if not otp.verify_code(code):
            return Response({"error": "Invalid or expired OTP"}, status=400)
        return Response({"message": "OTP verified successfully"})
class ResetPasswordOTPView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(ratelimit(key="ip", rate="3/m", block=True))
    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("password")
        if not email or not new_password:
            return Response({"error": "Email and password required"}, status=400)
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.filter(email=email).latest("created_at")
        except (User.DoesNotExist, OTP.DoesNotExist):
            return Response({"error": "User or OTP not found"}, status=404)
        if not otp.is_verified:
            return Response({"error": "OTP not verified"}, status=400)
        if not otp.is_valid():
            return Response({"error": "OTP expired"}, status=400)
        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.save()
        UserSession.objects.filter(user=user).update(is_active=False)
        OTP.objects.filter(email=email).delete()
        response = Response({"message": "Password reset successful"})
        response.delete_cookie("access", path="/")
        response.delete_cookie("refresh", path="/")
        return response
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Token required"}, status=400)
        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            if not idinfo.get("email_verified"):
                return Response({"error": "Email not verified by Google"}, status=400)
            email = idinfo.get("email")
        except Exception as e:
            return Response({"error": f"Invalid Google token: {str(e)}"}, status=400)
        user = User.objects.filter(email=email).first()
        if user and user.is_blocked:
            return Response({
                "error": "Your account has been blocked",
                "reason": user.blocked_reason
            }, status=403)
        if not user:
            user = User.objects.create(email=email, username=email, role="USER")
        refresh = RefreshToken.for_user(user)
        UserSession.objects.create(
            user=user,
            refresh_token=str(refresh),
            device=request.META.get("HTTP_USER_AGENT", "Google"),
            ip_address=get_client_ip(request),
        )
        AuthLog.objects.create(
            user=user,
            event="LOGIN",
            ip_address=get_client_ip(request),
            device="Google OAuth",
        )
        res = Response(
            {
                "message": "Google login successful",
                "role": user.role,
                "username": user.username,
            }
        )
        res.set_cookie(
            key="access",
            value=str(refresh.access_token),
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        res.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        return res
