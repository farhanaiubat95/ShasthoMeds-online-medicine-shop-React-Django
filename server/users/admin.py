from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms import ValidationError
from .models import Cart, CartItem, Category, CustomUser, EmailOTP, Brand, PrescriptionItem, PrescriptionRequest, Product
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
    list_display = ("id", "user", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("user__email",)

# Cart item model
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product", "quantity", "unit_price", "added_at")
    search_fields = ("cart__user__email", "product__name")

# PrescriptionRequest model
@admin.register(PrescriptionRequest)
class PrescriptionRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "approved_at", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email",)
    readonly_fields = ("created_at", "updated_at", "approved_at")

    def save_model(self, request, obj, form, change):
        if change:
            old_obj = PrescriptionRequest.objects.get(pk=obj.pk)
            if old_obj.status != obj.status:
                # Send email to user
                items = "\n".join([f"{i.product.name} ({i.product.sku})" for i in obj.items.all()])
                if obj.status == PrescriptionRequest.STATUS_APPROVED:
                    subject = "Prescription Approved"
                    message = f"Hello {obj.user.full_name},\n\nYour prescription has been APPROVED.\n\nProducts:\n{items}\n\nThank you!"
                elif obj.status == PrescriptionRequest.STATUS_REJECTED:
                    subject = "Prescription Rejected"
                    message = f"Hello {obj.user.full_name},\n\nYour prescription has been REJECTED.\n\nProducts:\n{items}\n\nPlease upload a new prescription if needed."

                try:
                    send_mail(
                        subject,
                        message,
                        settings.EMAIL_HOST_USER,
                        [obj.user.email],
                        fail_silently=False
                    )
                except Exception as e:
                    print("Email sending failed:", e)

        super().save_model(request, obj, form, change)

        
# PrescriptionItem model
@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = ("id", "prescription_request", "product", "quantity")
    search_fields = ("product__name",)
