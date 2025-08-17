from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms import ValidationError
from .models import Category, CustomUser, EmailOTP, Brand, Product
from django.utils import timezone
from django.core.mail import send_mail

# Use settings to get cloud info
cloud_name = settings.CLOUDINARY_STORAGE.get("CLOUD_NAME")

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
        "offer_price", "discount_price", "stock", "display_unit", "is_active",
        "created_at", "updated_at"
    )
    search_fields = ("sku", "name")
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("is_active", "category", "brand", "created_at")
    exclude = ('discount_price', "new_price")

    def save_model(self, request, obj, form, change):
        # Auto-calculate offer_price or discount_price
        if obj.offer_price is None:
            obj.offer_price = obj.price
        if obj.discount_price is None:
            obj.discount_price = obj.price - (obj.price * 0.1)
        
        # Check each image field for Cloudinary
        for img_field in ['image1', 'image2', 'image3']:
            img = getattr(obj, img_field)
            if img:
                print(f"{img_field} uploaded to: {img.url}")  # Cloudinary URL
                if cloud_name and "res.cloudinary.com" not in img.url:
                    raise ValidationError(f"{img_field} was not uploaded to Cloudinary!")
                
        super().save_model(request, obj, form, change)
