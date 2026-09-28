from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdminHR

from .filters import LeaveRequestFilter
from .models import LeaveBalance, LeaveRequest, LeaveType
from .serializers import (
    LeaveBalanceSerializer,
    LeaveRequestSerializer,
    LeaveTypeSerializer,
    ReviewSerializer,
)
from .services import approve_request, reject_request


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all().order_by("name")
    serializer_class = LeaveTypeSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAdminHR()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if LeaveRequest.objects.filter(leave_type=instance).exists():
            return Response(
                {"detail": "This leave type is used by existing leave requests and cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class LeaveBalanceViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        year = self.request.query_params.get("year", timezone.localdate().year)
        return LeaveBalance.objects.filter(user=self.request.user, year=year).select_related("leave_type")


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = LeaveRequestFilter

    def get_queryset(self):
        qs = LeaveRequest.objects.select_related("user", "user__department", "leave_type", "reviewed_by")
        if self.request.user.role == "admin" and self.action == "all":
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user or instance.status != LeaveRequest.PENDING:
            return Response(
                {"detail": "Only your own pending request can be updated."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user or instance.status != LeaveRequest.PENDING:
            return Response(
                {"detail": "Only your own pending request can be updated."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Use the cancel action instead."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=["get"], permission_classes=[IsAdminHR])
    def all(self, request):
        page = self.paginate_queryset(self.filter_queryset(self.get_queryset()))
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        obj = self.get_object()
        if obj.user != request.user or obj.status != LeaveRequest.PENDING:
            return Response(
                {"detail": "Only your own pending request can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        obj.status = LeaveRequest.CANCELLED
        obj.save()
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminHR])
    def approve(self, request, pk=None):
        obj = LeaveRequest.objects.get(pk=pk)
        if obj.status != LeaveRequest.PENDING:
            return Response({"detail": "Only pending requests can be approved."}, status=400)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approve_request(obj, request.user, serializer.validated_data.get("remarks", ""))
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminHR])
    def reject(self, request, pk=None):
        obj = LeaveRequest.objects.get(pk=pk)
        if obj.status != LeaveRequest.PENDING:
            return Response({"detail": "Only pending requests can be rejected."}, status=400)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reject_request(obj, request.user, serializer.validated_data.get("remarks", ""))
        return Response(self.get_serializer(obj).data)
