
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import  Cart, CartItem, Category, CustomUser, EmailOTP, Brand, PrescriptionRequest,Product
from django.db import transaction
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.html import format_html

EMAIL_HOST_USER = settings.EMAIL_HOST_USER

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
    # Removed save_model as validation is handled by CloudinaryField

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
        "offer_price", "discount_price", "stock","weight_display","unit_display", "package_quantity","prescription_required","is_active",
        "created_at", "updated_at"
    )
    search_fields = ("sku", "name")
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("is_active", "category", "brand", "created_at")
    exclude = ('discount_price', "new_price", "weight_display","unit_display" )

    def save_model(self, request, obj, form, change):
        # Automatically set package_quantity based on unit
        if obj.unit in ['tablet', 'capsule']:
            obj.package_quantity = 'strip'
        elif obj.unit == 'bottle':
            obj.package_quantity = 'box'
        else:
            obj.package_quantity = None

        super().save_model(request, obj, form, change)


# Cart model
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at", "updated_at")
    search_fields = ("user__email",)
    list_filter = ("created_at",)

# CartItem model
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product", "quantity", "added_at")
    search_fields = ("product__name", "cart__user__email")
    list_filter = ("added_at",)

# --- PrescriptionRequest admin ---
@admin.register(PrescriptionRequest)
class PrescriptionRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "status", "image_preview", "created_at", "reviewed_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__email", "product__name")
    actions = ["approve_selected", "reject_selected"]

    # Image preview method
    def image_preview(self, obj):
        if obj.uploaded_image:
            return format_html('<a href="{}" target="_blank"><img src="{}" width="100" /></a>', obj.uploaded_image.url, obj.uploaded_image.url)
        return "-"
    image_preview.short_description = "Prescription"

    @transaction.atomic
    def approve_selected(self, request, queryset):
        for pr in queryset.select_for_update().filter(status="pending"):
            cart, _ = Cart.objects.get_or_create(user=pr.user)
            item, created = CartItem.objects.get_or_create(cart=cart, product=pr.product)
            if not created:
                item.quantity += 1
            item.save()

            # Send email to user
            product_lines = [
                "Product Name | SKU | Quantity",
                "-----------------------------",
                f"{pr.product.name} | {pr.product.sku} | 1"
            ]
            product_table = "\n".join(product_lines)
            try:
                send_mail(
                    subject="Prescription Approved - ShasthoMeds",
                    message=f"Hi {pr.user.full_name},\n\nYour prescription request #{pr.product.id} has been approved."
                            f" The item(s) were added to your cart.\nProducts:\n{product_table}\n\nEnjoy your medication!",
                    from_email=EMAIL_HOST_USER,
                    recipient_list=[pr.user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

            pr.status = "approved"
            pr.reviewed_at = timezone.now()
            pr.save()
            pr.delete()

    approve_selected.short_description = "Approve selected (add to cart, email user, delete request)"

    @transaction.atomic
    def reject_selected(self, request, queryset):
        for pr in queryset.select_for_update().filter(status="pending"):
            try:
                send_mail(
                    subject="Prescription Rejected - ShasthoMeds",
                    message=f"Hi {pr.user.full_name},\n\nYour prescription for {pr.product.name} was rejected.\n"
                            f"Reason: {pr.admin_comment or 'Not specified'}\nTry again later with a valid prescription.",
                    from_email=EMAIL_HOST_USER,
                    recipient_list=[pr.user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

            pr.status = "rejected"
            pr.reviewed_at = timezone.now()
            pr.save()
            pr.delete()

    reject_selected.short_description = "Reject selected (email user, delete request)"