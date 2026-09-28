from rest_framework import serializers

from .models import LeaveBalance, LeaveRequest, LeaveType
from .services import validate_leave_request


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ["id", "name", "default_days", "requires_document"]


class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source="leave_type.name", read_only=True)
    remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = [
            "id", "leave_type", "leave_type_name", "year",
            "entitled_days", "used_days", "remaining",
        ]


class LeaveRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    department_name = serializers.CharField(source="user.department.name", read_only=True)
    designation = serializers.CharField(source="user.designation", read_only=True)
    leave_type_name = serializers.CharField(source="leave_type.name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.full_name", read_only=True)
    balance_entitled = serializers.SerializerMethodField()
    balance_used = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest
        fields = [
            "id", "user", "user_name", "department_name", "designation",
            "leave_type", "leave_type_name",
            "from_date", "to_date", "days", "reason", "status", "applied_on",
            "reviewed_by", "reviewed_by_name", "reviewed_on", "remarks",
            "balance_entitled", "balance_used",
        ]
        read_only_fields = [
            "user", "days", "status", "applied_on", "reviewed_by", "reviewed_on", "remarks",
        ]

    def _balance(self, obj):
        if obj.leave_type.default_days <= 0:
            return None
        return LeaveBalance.objects.filter(
            user=obj.user, leave_type=obj.leave_type, year=obj.from_date.year
        ).first()

    def get_balance_entitled(self, obj):
        balance = self._balance(obj)
        if balance:
            return balance.entitled_days
        return obj.leave_type.default_days or None

    def get_balance_used(self, obj):
        balance = self._balance(obj)
        return balance.used_days if balance else 0

    def validate(self, attrs):
        from_date = attrs.get("from_date", getattr(self.instance, "from_date", None))
        to_date = attrs.get("to_date", getattr(self.instance, "to_date", None))
        leave_type = attrs.get("leave_type", getattr(self.instance, "leave_type", None))
        user = self.context["request"].user

        validate_leave_request(
            user=user,
            leave_type=leave_type,
            from_date=from_date,
            to_date=to_date,
            exclude_id=self.instance.id if self.instance else None,
        )
        return attrs


class ReviewSerializer(serializers.Serializer):
    remarks = serializers.CharField(required=False, allow_blank=True, default="")
