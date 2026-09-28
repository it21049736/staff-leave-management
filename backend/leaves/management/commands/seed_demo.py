from datetime import date, timedelta

from django.core.management.base import BaseCommand

from accounts.models import Department, User
from leaves.models import LeaveBalance, LeaveRequest, LeaveType


class Command(BaseCommand):
    help = "Seed demo departments, leave types, users, balances and sample leave requests."

    def handle(self, *args, **options):
        today = date.today()

        dept_names = ["Engineering", "Human Resources", "Product Design", "Marketing", "Finance"]
        depts = {}
        for name in dept_names:
            depts[name], _ = Department.objects.get_or_create(name=name)

        leave_types_def = [
            ("Annual", 18, False),
            ("Sick", 10, True),
            ("Casual", 7, False),
            ("Parental", 30, True),
            ("Compensatory Off", 5, False),
            ("No-pay", 0, False),
        ]
        leave_types = {}
        for name, days, requires_doc in leave_types_def:
            leave_types[name], _ = LeaveType.objects.get_or_create(
                name=name, defaults={"default_days": days, "requires_document": requires_doc}
            )

        if not User.objects.filter(username="admin").exists():
            admin = User.objects.create_superuser(
                username="admin", email="admin@example.com", password="Admin@1234"
            )
            admin.role = "admin"
            admin.first_name = "System"
            admin.last_name = "Admin"
            admin.department = depts["Human Resources"]
            admin.designation = "HR Manager"
            admin.joined_date = today
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin / Admin@1234"))

        employees_def = [
            ("employee1", "Jane", "Doe", "Engineering", "Software Engineer"),
            ("sarah.jenkins", "Sarah", "Jenkins", "Engineering", "Backend Engineer"),
            ("marcus.vance", "Marcus", "Vance", "Product Design", "Product Designer"),
            ("elena.rostova", "Elena", "Rostova", "Marketing", "Marketing Lead"),
            ("daniel.wu", "Daniel", "Wu", "Finance", "Financial Analyst"),
            ("alex.rivera", "Alex", "Rivera", "Engineering", "DevOps Engineer"),
            ("karen.lewis", "Karen", "Lewis", "Human Resources", "HR Coordinator"),
            ("thomas.chen", "Thomas", "Chen", "Product Design", "UX Researcher"),
        ]

        employees = {}
        for username, first, last, dept, designation in employees_def:
            emp = User.objects.filter(username=username).first()
            if not emp:
                emp = User.objects.create_user(
                    username=username, email=f"{username.replace('.', '')}@company.io", password="Employee@1234"
                )
            emp.role = "employee"
            emp.first_name = first
            emp.last_name = last
            emp.department = depts[dept]
            emp.designation = designation
            emp.joined_date = emp.joined_date or today
            emp.save()
            employees[username] = emp

            for lt in LeaveType.objects.filter(default_days__gt=0):
                LeaveBalance.objects.get_or_create(
                    user=emp, leave_type=lt, year=today.year,
                    defaults={"entitled_days": lt.default_days},
                )

        if employees_def:
            self.stdout.write(self.style.SUCCESS(f"Ensured {len(employees_def)} employee accounts (password: Employee@1234)"))

        admin = User.objects.get(username="admin")

        if not LeaveRequest.objects.exists():
            requests_def = [
                # username, leave type, from offset, to offset, status, reason
                ("sarah.jenkins", "Annual", 7, 10, "pending", "Family trip and personal recharge"),
                ("marcus.vance", "Sick", 3, 4, "pending", "Dental surgery recovery"),
                ("elena.rostova", "Parental", 15, 46, "pending", "Maternity transition phase"),
                ("daniel.wu", "Compensatory Off", 4, 4, "pending", "Weekend overtime payback"),
                ("thomas.chen", "Casual", 2, 2, "pending", "Personal errand"),
                ("karen.lewis", "Sick", 6, 7, "pending", "Flu recovery"),
                ("employee1", "Annual", 12, 13, "pending", "Long weekend getaway"),
                ("alex.rivera", "Annual", -3, 1, "approved", "Family trip"),
                ("karen.lewis", "Sick", -1, 0, "approved", "Feeling unwell"),
                ("thomas.chen", "Casual", -5, -3, "approved", "Personal time off"),
                ("employee1", "Annual", -20, -18, "approved", "Short vacation"),
                ("sarah.jenkins", "Sick", -30, -29, "approved", "Doctor visit"),
                ("marcus.vance", "No-pay", -10, -8, "rejected", "Policy clash with sprint deadline"),
                ("daniel.wu", "Casual", -15, -15, "cancelled", "Plans changed"),
            ]
            created = 0
            for username, lt_name, from_offset, to_offset, status, reason in requests_def:
                user = employees.get(username)
                if not user:
                    continue
                req = LeaveRequest(
                    user=user,
                    leave_type=leave_types[lt_name],
                    from_date=today + timedelta(days=from_offset),
                    to_date=today + timedelta(days=to_offset),
                    reason=reason,
                    status=status,
                )
                if status in (LeaveRequest.APPROVED, LeaveRequest.REJECTED):
                    req.reviewed_by = admin
                    req.reviewed_on = today
                req.save()
                created += 1
            self.stdout.write(self.style.SUCCESS(f"Created {created} sample leave requests."))

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
