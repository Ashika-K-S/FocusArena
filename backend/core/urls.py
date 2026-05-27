from django.contrib import admin
from django.urls import path, include
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/rooms/", include("rooms.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/admin/", include("administration.urls")),
    path("api/ai/", include("ai.urls")),
]
