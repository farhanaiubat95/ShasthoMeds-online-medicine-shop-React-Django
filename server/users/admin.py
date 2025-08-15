from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from shasthomeds.settings import EMAIL_HOST_USER
from .models import (
    CustomUser, EmailOTP
)
from django.utils import timezone
from django.core.mail import send_mail

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('full_name', 'username', 'email', 'phone', 'gender', 'city', 'address', 'date_of_birth', 'is_verified', 'is_active', 'role')
    fieldsets = UserAdmin.fieldsets + (
        ("Personal Info", {
            'fields': ('full_name', 'phone', 'gender', 'date_of_birth', 'city', 'address', 'is_verified', 'role')
        }),
    )

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('full_name', 'username', 'email', 'phone', 'gender', 'city', 'address', 'date_of_birth', 'is_verified', 'is_active', 'role')
    fieldsets = UserAdmin.fieldsets + (
        ("Personal Info", {
            'fields': ('full_name', 'phone', 'gender', 'date_of_birth', 'city', 'address', 'is_verified', 'role')
        }),
    )

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp_code', 'created_at')
    search_fields = ('user__email',)
