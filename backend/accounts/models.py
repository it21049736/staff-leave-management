from django.contrib.auth.models import AbstractUser
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    EMPLOYEE, ADMIN = "employee", "admin"
    ROLE = [(EMPLOYEE, "Employee"), (ADMIN, "Admin/HR")]

    role = models.CharField(max_length=10, choices=ROLE, default=EMPLOYEE)
    department = models.ForeignKey(
        Department, null=True, blank=True, on_delete=models.SET_NULL, related_name="users"
    )
    designation = models.CharField(max_length=60, blank=True)
    joined_date = models.DateField(null=True, blank=True)

    @property
    def full_name(self):
        return self.get_full_name() or self.username

    def __str__(self):
        return self.full_name
