from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    SendOTPView, VerifyOTPView, ResetPasswordOTPView,
    LogoutView, RefreshTokenView, LogoutAllView, SessionListView,
    AdminUsersListView,GoogleLoginView
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('refresh/', RefreshTokenView.as_view()),
    path('profile/', ProfileView.as_view()),

    path('send-otp/', SendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('reset-password/', ResetPasswordOTPView.as_view()),

    path('logout/', LogoutView.as_view()),  

    path('logout-all/', LogoutAllView.as_view()),
    path('sessions/', SessionListView.as_view()),

    
    path('admin/users/', AdminUsersListView.as_view()),

    path('google-login/', GoogleLoginView.as_view()),


]