from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import ChangePasswordView, DepartmentViewSet, MeView, MyTokenObtainPairView, UserViewSet

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="department")
router.register("users", UserViewSet, basename="user")

urlpatterns = [
    path("auth/login/", MyTokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("", include(router.urls)),
]
