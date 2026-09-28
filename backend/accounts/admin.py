from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Department, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Leave management", {"fields": ("role", "department", "designation", "joined_date")}),
    )
    list_display = ["username", "email", "role", "department", "is_active"]


admin.site.register(Department)
