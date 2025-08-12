from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from shasthomeds.settings import EMAIL_HOST_USER
from .models import CustomUser, EmailOTP
from django.utils import timezone
from django.core.mail import send_mail

# category
from .models import (
    Category, Brand, Product,
    PrescriptionRequest, PrescriptionItem,
    Cart, CartItem,
    Order, OrderItem, Payment
)

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


# category
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "is_active", "created_at")
    list_filter = ("is_active", "parent")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "sku", "category", "brand", "price", "offer_percentage",
        "new_price", "discount_price", "stock", "prescription_required", "is_active"
    )
    list_filter = ("category", "brand", "prescription_required", "is_active")
    search_fields = ("name", "sku")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("price", "stock", "is_active")
    readonly_fields = ("new_price", "discount_price")

    def save_model(self, request, obj, form, change):
        obj.save()  # triggers Product.save() auto-calculation


class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 0


# --- Updated Approve Action ---
@admin.action(description="Approve selected prescriptions")
def approve_prescriptions(modeladmin, request, queryset):
    for pres in queryset:
        pres.status = PrescriptionRequest.STATUS_APPROVED
        pres.approved_at = timezone.now()
        pres.reviewed_by = request.user
        pres.save()

        # Auto-add to cart if enabled
        if pres.auto_add_to_cart:
            cart, _ = Cart.objects.get_or_create(user=pres.user, is_active=True)
            for item in pres.items.all():
                CartItem.objects.create(
                    cart=cart,
                    product=item.product,
                    quantity=item.quantity,
                    unit_price=item.product.get_price(),
                    prescription_request=pres
                )

        # Send approval email
        send_mail(
            subject="Your Prescription has been Approved",
            message=(
                f"Dear {pres.user.full_name},\n\n"
                "Your prescription has been approved. You can now purchase the requested products.\n\n"
                "Thank you for using ShasthoMeds."
            ),
            from_email=EMAIL_HOST_USER,
            recipient_list=[pres.user.email],
            fail_silently=True
        )

# --- Updated Reject Action ---
@admin.action(description="Reject selected prescriptions")
def reject_prescriptions(modeladmin, request, queryset):
    for pres in queryset:
        pres.status = PrescriptionRequest.STATUS_REJECTED
        pres.reviewed_by = request.user
        pres.save()

        # Send rejection email
        send_mail(
            subject="Your Prescription has been Rejected",
            message=(
                f"Dear {pres.user.full_name},\n\n"
                "Unfortunately, your prescription has been rejected. "
                "Please contact our support team for more details.\n\n"
                "Thank you for using ShasthoMeds."
            ),
            from_email=EMAIL_HOST_USER,
            recipient_list=[pres.user.email],
            fail_silently=True
        )


@admin.register(PrescriptionRequest)
class PrescriptionRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "created_at", "approved_at", "auto_add_to_cart")
    list_filter = ("status", "auto_add_to_cart", "created_at")
    search_fields = ("user__email", "user__full_name")
    inlines = [PrescriptionItemInline]
    actions = [approve_prescriptions, reject_prescriptions]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "is_active", "created_at", "updated_at")
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "user", "status", "payment_method", "payment_status", "total_amount", "placed_at")
    list_filter = ("status", "payment_status", "payment_method")
    search_fields = ("order_number", "user__email")
    inlines = [OrderItemInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "gateway", "transaction_id", "amount", "status", "paid_at")
    list_filter = ("status", "gateway")
    search_fields = ("transaction_id", "order__order_number")

