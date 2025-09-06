
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import  Cart, CartItem, Category, CustomUser, EmailOTP, Brand, MonthlyReport, Order,PrescriptionRequest,Product, YearlyReport
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
        'id','full_name', 'username', 'email', 'phone', 'gender', 'city', 'address',
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
    list_display = (
        "id", "user",
        "total_items", "total_quantity", "total_price",
        "created_at", "updated_at"
    )
    search_fields = ("user__email",)
    list_filter = ("created_at",)

    def total_items(self, obj):
        return obj.items.count()
    total_items.short_description = "Items"

    def total_quantity(self, obj):
        return sum(item.quantity for item in obj.items.all())
    total_quantity.short_description = "Quantity"

    def total_price(self, obj):
        total = 0
        for item in obj.items.all():
            if item.product and item.product.offer_price:
                total += float(item.product.new_price) * item.quantity
            else:
                total += float(item.product.price) * item.quantity
        return round(total, 2)
    total_price.short_description = "Total Price (৳)"


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
            pr.approve()
    approve_selected.short_description = "Approve selected (add to cart + email + delete request)"

    @transaction.atomic
    def reject_selected(self, request, queryset):
        for pr in queryset.select_for_update().filter(status="pending"):
            pr.reject()
    reject_selected.short_description = "Reject selected (email + delete request)"

# Order model
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "payment_method",
        "tran_id",
        "total_amount",
        "payment_status",
        "status",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "user__email",
        "tran_id",
        "status",
        "payment_status",
    )
    list_filter = ("payment_method", "payment_status", "status", "created_at")
    readonly_fields = ("tran_id", "created_at", "updated_at")

    # Show nested items in the order change page
    def items_list(self, obj):
        return ", ".join([f"{item.productName} (x{item.quantity})" for item in obj.items.all()])
    items_list.short_description = "Items"

    # Optional: add items_list to readonly_fields if you want to see it
    readonly_fields += ("items_list",)

# --- Monthly Report ---
@admin.register(MonthlyReport)
class MonthlyReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "month",
        "total_income",
        "total_profit",
        "total_orders",
        "total_products_sold",
        "top_product",
        "created_at",
        "updated_at",
    )
    search_fields = ("top_product",)
    list_filter = ("month", "created_at")
    readonly_fields = (
        "month",
        "total_income",
        "total_profit",
        "total_orders",
        "total_products_sold",
        "top_product",
        "products_details",
        "created_at",
        "updated_at",
    )

# --- Yearly Report ---
@admin.register(YearlyReport)
class YearlyReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "year",
        "total_income",
        "total_profit",
        "total_orders",
        "total_products_sold",
        "top_product",
        "created_at",
        "updated_at",
    )
    search_fields = ("top_product",)
    list_filter = ("year", "created_at")
    readonly_fields = (
        "year",
        "total_income",
        "total_profit",
        "total_orders",
        "total_products_sold",
        "top_product",
        "products_details",
        "created_at",
        "updated_at",
    )
