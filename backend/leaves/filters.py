import django_filters

from .models import LeaveRequest


class LeaveRequestFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    dept = django_filters.NumberFilter(field_name="user__department_id")
    q = django_filters.CharFilter(method="filter_q")
    from_date = django_filters.DateFilter(field_name="from_date", lookup_expr="gte")
    to_date = django_filters.DateFilter(field_name="to_date", lookup_expr="lte")

    class Meta:
        model = LeaveRequest
        fields = ["status", "leave_type"]

    def filter_q(self, queryset, name, value):
        return queryset.filter(user__first_name__icontains=value) | queryset.filter(
            user__last_name__icontains=value
        ) | queryset.filter(user__username__icontains=value)
