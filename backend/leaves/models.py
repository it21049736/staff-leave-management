from django.conf import settings
from django.db import models


class LeaveType(models.Model):
    name = models.CharField(max_length=40, unique=True)
    default_days = models.PositiveIntegerField(default=0)  # 0 = unlimited (no-pay)
    requires_document = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class LeaveBalance(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="balances"
    )
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.PositiveIntegerField()
    entitled_days = models.PositiveIntegerField()
    used_days = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("user", "leave_type", "year")

    @property
    def remaining(self):
        return self.entitled_days - self.used_days

    def __str__(self):
        return f"{self.user} / {self.leave_type} / {self.year}"


class LeaveRequest(models.Model):
    PENDING, APPROVED, REJECTED, CANCELLED = "pending", "approved", "rejected", "cancelled"
    STATUS = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
        (CANCELLED, "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_requests"
    )
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    from_date = models.DateField()
    to_date = models.DateField()
    days = models.PositiveIntegerField(editable=False)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS, default=PENDING)
    applied_on = models.DateField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_requests",
    )
    reviewed_on = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ["-applied_on", "-id"]

    def save(self, *args, **kwargs):
        if self.from_date and self.to_date:
            self.days = (self.to_date - self.from_date).days + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} {self.from_date}..{self.to_date} ({self.status})"
