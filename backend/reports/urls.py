from django.urls import path

from .views import ByDepartmentReportView, ExportCSVView, SummaryReportView

urlpatterns = [
    path("summary/", SummaryReportView.as_view(), name="report-summary"),
    path("by-department/", ByDepartmentReportView.as_view(), name="report-by-department"),
    path("export/", ExportCSVView.as_view(), name="report-export"),
]
