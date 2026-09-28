from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LeaveBalanceViewSet, LeaveRequestViewSet, LeaveTypeViewSet

router = DefaultRouter()
router.register("leave-types", LeaveTypeViewSet, basename="leave-type")
router.register("balances", LeaveBalanceViewSet, basename="balance")
router.register("leaves", LeaveRequestViewSet, basename="leave-request")

urlpatterns = [
    path("", include(router.urls)),
]
