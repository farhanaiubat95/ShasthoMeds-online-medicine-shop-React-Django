from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms import ValidationError
from .models import Category, CustomUser, EmailOTP, Brand, Product
from django.core.mail import send_mail

# CustomUser model
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = (
        'full_name', 'username', 'email', 'phone', 'gender', 'city', 'address',
        'date_of_birth', 'is_verified', 'is_active', 'role'
    )
    fieldsets = UserAdmin.fieldsets + (
        ("Personal Info", {
            'fields': ('full_name', 'phone', 'gender', 'date_of_birth', 'city', 'address', 'is_verified', 'role')
        }),
    )

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp_code', 'created_at')
    search_fields = ('user__email',)

# Brand model
@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "created_at", "updated_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    def save_model(self, request, obj, form, change):
        if obj.image and obj.image.size > 2 * 1024 * 1024:
            raise ValidationError("Image size must be 2 MB or less.")
        super().save_model(request, obj, form, change)

# Category model
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "parent", "is_active", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    list_filter = ("is_active", "created_at")

# Product model
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id", "sku", "name", "slug", "category", "brand", "price", "new_price",
        "offer_price", "discount_price", "stock", "display_unit", "package_quantity", "is_active",
        "created_at", "updated_at"
    )
    search_fields = ("sku", "name")
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("is_active", "category", "brand", "created_at")
    exclude = ('discount_price', "new_price")

    def save_model(self, request, obj, form, change):
        if obj.offer_price is None:
            obj.offer_price = obj.price
        if obj.discount_price is None:
            obj.discount_price = obj.price - (obj.price * 0.1)
        
        # Automatically set package_quantity based on unit
        if obj.unit in ['tablet', 'capsule']:
            obj.package_quantity = 'strip'
        elif obj.unit == 'bottle':
            obj.package_quantity = 'box'
        else:
            obj.package_quantity = None

        # Validate image size (max 2MB each)
        for img_field in ['image1', 'image2', 'image3']:
            img = getattr(obj, img_field)
            if img and hasattr(img, 'size') and img.size > 2 * 1024 * 1024:
                raise ValidationError(f"{img_field} size must be 2 MB or less.")

        super().save_model(request, obj, form, change)
