from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, EmailOTP

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    

    list_display = (
        'full_name', 'username','email', 'phone', 'gender', 
        'city', 'address', 'date_of_birth', 'is_verified', 'is_active', 'role'
    )

    fieldsets = UserAdmin.fieldsets + (
        ("Personal Info", {
            'fields': (
                'full_name','phone', 'gender', 'date_of_birth',
                'city', 'address', 'is_verified', 'role' # ()'username', 'email') are already present in the default fieldsets
            )
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(EmailOTP)
