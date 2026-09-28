from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import LeaveBalance, LeaveRequest

MAX_BACKDATE_DAYS = 30


def validate_leave_request(*, user, leave_type, from_date, to_date, exclude_id=None):
    """Shared validation for creating/updating a leave request. Raises DRF ValidationError."""
    if to_date < from_date:
        raise serializers.ValidationError({"to_date": "to_date must be on or after from_date."})

    earliest_allowed = timezone.localdate() - timedelta(days=MAX_BACKDATE_DAYS)
    if from_date < earliest_allowed:
        raise serializers.ValidationError(
            {"from_date": f"Requests cannot be back-dated more than {MAX_BACKDATE_DAYS} days."}
        )

    overlap_qs = LeaveRequest.objects.filter(
        user=user,
        status__in=[LeaveRequest.PENDING, LeaveRequest.APPROVED],
        from_date__lte=to_date,
        to_date__gte=from_date,
    )
    if exclude_id:
        overlap_qs = overlap_qs.exclude(id=exclude_id)
    if overlap_qs.exists():
        raise serializers.ValidationError(
            "This request overlaps with an existing pending or approved leave request."
        )

    days = (to_date - from_date).days + 1

    if leave_type.default_days > 0:
        year = from_date.year
        balance, _ = LeaveBalance.objects.get_or_create(
            user=user,
            leave_type=leave_type,
            year=year,
            defaults={"entitled_days": leave_type.default_days},
        )
        pending_days = sum(
            r.days
            for r in LeaveRequest.objects.filter(
                user=user,
                leave_type=leave_type,
                status=LeaveRequest.PENDING,
                from_date__year=year,
            ).exclude(id=exclude_id)
        )
        reserved = balance.used_days + pending_days
        if reserved + days > balance.entitled_days:
            raise serializers.ValidationError(
                f"Insufficient balance: {balance.remaining - pending_days} day(s) remaining "
                f"for {leave_type.name} after pending requests."
            )

    return days


def approve_request(leave_request, reviewer, remarks=""):
    leave_request.status = LeaveRequest.APPROVED
    leave_request.reviewed_by = reviewer
    leave_request.reviewed_on = timezone.localdate()
    leave_request.remarks = remarks
    leave_request.save()

    if leave_request.leave_type.default_days > 0:
        balance, _ = LeaveBalance.objects.get_or_create(
            user=leave_request.user,
            leave_type=leave_request.leave_type,
            year=leave_request.from_date.year,
            defaults={"entitled_days": leave_request.leave_type.default_days},
        )
        balance.used_days += leave_request.days
        balance.save()

    return leave_request


def reject_request(leave_request, reviewer, remarks=""):
    leave_request.status = LeaveRequest.REJECTED
    leave_request.reviewed_by = reviewer
    leave_request.reviewed_on = timezone.localdate()
    leave_request.remarks = remarks
    leave_request.save()
    return leave_request
