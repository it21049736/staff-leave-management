import csv

from django.db.models import Sum
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminHR
from leaves.models import LeaveRequest


class SummaryReportView(APIView):
    permission_classes = [IsAdminHR]

    def get(self, request):
        counts = {
            status: LeaveRequest.objects.filter(status=status).count()
            for status, _ in LeaveRequest.STATUS
        }
        by_type = list(
            LeaveRequest.objects.filter(status=LeaveRequest.APPROVED)
            .values("leave_type__name")
            .annotate(total_days=Sum("days"))
            .order_by("leave_type__name")
        )
        return Response({"by_status": counts, "by_type": by_type})


class ByDepartmentReportView(APIView):
    permission_classes = [IsAdminHR]

    def get(self, request):
        data = list(
            LeaveRequest.objects.filter(status=LeaveRequest.APPROVED)
            .values("user__department__name")
            .annotate(total_days=Sum("days"))
            .order_by("user__department__name")
        )
        return Response(data)


class ExportCSVView(APIView):
    permission_classes = [IsAdminHR]

    def get(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="leave_requests.csv"'
        writer = csv.writer(response)
        writer.writerow(
            ["Employee", "Department", "Leave Type", "From", "To", "Days", "Status", "Applied On", "Reviewed By"]
        )
        qs = LeaveRequest.objects.select_related("user", "user__department", "leave_type", "reviewed_by")
        for r in qs:
            writer.writerow(
                [
                    r.user.full_name,
                    r.user.department.name if r.user.department else "",
                    r.leave_type.name,
                    r.from_date,
                    r.to_date,
                    r.days,
                    r.status,
                    r.applied_on,
                    r.reviewed_by.full_name if r.reviewed_by else "",
                ]
            )
        return response
