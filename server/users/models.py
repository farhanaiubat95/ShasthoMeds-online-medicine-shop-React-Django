from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

# store/models.py
from uuid import uuid4
from decimal import Decimal, InvalidOperation
from django.utils.text import slugify


# Custom user model
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
     
    full_name = models.CharField(max_length=150, default="Your Name")
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, default="")
    gender = models.CharField(max_length=10, default="Other")
    city = models.CharField(max_length=100, default="Dhaka")
    date_of_birth = models.DateField(default="2000-01-01")
    address = models.TextField(default="")
    is_verified = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  

# OTP model
class EmailOTP(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"{self.user.email} - OTP: {self.otp_code}"
    

# Category model



class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to="categories/", null=True, blank=True)
    parent = models.ForeignKey(
        "self", null=True, blank=True, related_name="subcategories", on_delete=models.CASCADE
    )  # subcategory system
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to="brands/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name



class Product(models.Model):
    sku = models.CharField(max_length=64, unique=True, db_index=True)  # stock keeping unit
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey("Category", related_name="products", on_delete=models.PROTECT)
    brand = models.ForeignKey("Brand", related_name="products", on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # base price
    new_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, editable=False)
    offer_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, editable=False)
    stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, blank=True)  # e.g., 'box', 'bottle'
    prescription_required = models.BooleanField(default=False, db_index=True)
    image1 = models.ImageField(upload_to="products/")  # main image required
    image2 = models.ImageField(upload_to="products/", blank=True, null=True)  # optional
    image3 = models.ImageField(upload_to="products/", blank=True, null=True)  # optional

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["sku"]),
            models.Index(fields=["prescription_required"]),
        ]

    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            self.slug = slugify(self.name)

        # Calculate new_price and discount_price automatically if offer_percentage is set
        if self.offer_percentage is not None:
            try:
                percentage = Decimal(self.offer_percentage)
                self.new_price = self.price - (self.price * (percentage / Decimal(100)))
                self.discount_price = self.price - self.new_price
            except (InvalidOperation, ZeroDivisionError):
                self.new_price = None
                self.discount_price = None
        else:
            self.new_price = None
            self.discount_price = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def get_price(self):
        """Return effective price (discount if available)."""
        if self.new_price and self.new_price < self.price:
            return self.new_price
        return self.price


class PrescriptionRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="prescription_requests", on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    uploaded_file = models.FileField(upload_to="prescriptions/")  # can be image or PDF
    notes = models.TextField(null=True, blank=True)               # optional user message
    admin_notes = models.TextField(null=True, blank=True)         # admin comment on reject/approve
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        related_name="reviewed_prescriptions", on_delete=models.SET_NULL
    )  # admin user
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    auto_add_to_cart = models.BooleanField(default=True)  # if True, the system will auto-add approved items to cart

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Prescription #{self.pk} by {getattr(self.user, 'email', str(self.user))} - {self.status}"


class PrescriptionItem(models.Model):
    prescription_request = models.ForeignKey(PrescriptionRequest, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="prescription_items", on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    note = models.CharField(max_length=255, null=True, blank=True)  # optional per-item comment

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="carts", on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Cart #{self.pk} for {getattr(self.user, 'email', self.user)}"

    def get_total(self):
        total = Decimal("0.00")
        for it in self.items.all():
            total += (it.unit_price or Decimal("0.00")) * it.quantity
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)  # snapshot of price at add time
    prescription_request = models.ForeignKey(PrescriptionRequest, null=True, blank=True, on_delete=models.SET_NULL)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart #{self.cart_id}"

    def subtotal(self):
        return (self.unit_price or Decimal("0.00")) * self.quantity


class Order(models.Model):
    # status choices
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_PROCESSING = "processing"
    STATUS_SHIPPED = "shipped"
    STATUS_DELIVERED = "delivered"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_PROCESSING, "Processing"),
        (STATUS_SHIPPED, "Shipped"),
        (STATUS_DELIVERED, "Delivered"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    PAYMENT_COD = "cod"
    PAYMENT_ONLINE = "online"
    PAYMENT_METHOD_CHOICES = [(PAYMENT_COD, "Cash on Delivery"), (PAYMENT_ONLINE, "Online")]

    PAYMENT_STATUS_PENDING = "pending"
    PAYMENT_STATUS_PAID = "paid"
    PAYMENT_STATUS_FAILED = "failed"
    PAYMENT_STATUS_REFUNDED = "refunded"
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PENDING, "Pending"),
        (PAYMENT_STATUS_PAID, "Paid"),
        (PAYMENT_STATUS_FAILED, "Failed"),
        (PAYMENT_STATUS_REFUNDED, "Refunded"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="orders", on_delete=models.CASCADE)
    order_number = models.CharField(max_length=64, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    shipping_address = models.TextField()      # a denormalized snapshot
    shipping_city = models.CharField(max_length=100)
    shipping_phone = models.CharField(max_length=30)
    postal_code = models.CharField(max_length=20, blank=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_STATUS_PENDING)
    placed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    admin_note = models.TextField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    delivery_option = models.CharField(max_length=50, null=True, blank=True)
    tracking_number = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        ordering = ["-placed_at"]

    def __str__(self):
        return f"Order {self.order_number} by {getattr(self.user, 'email', self.user)}"

    def save(self, *args, **kwargs):
        # auto-generate order_number if absent
        if not self.order_number:
            ts = timezone.now().strftime("%Y%m%d%H%M%S")
            self.order_number = f"ORD{ts}{str(uuid4())[:6].upper()}"
        super().save(*args, **kwargs)

    def calculate_totals(self):
        total = Decimal("0.00")
        for it in self.items.all():
            total += (it.subtotal or Decimal("0.00"))
        self.total_amount = total
        self.save(update_fields=["total_amount"])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=255)   # denormalized name snapshot
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)  # snapshot
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    prescription_request = models.ForeignKey(PrescriptionRequest, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} x {self.product_name} ({self.order.order_number})"


class Payment(models.Model):
    PAYMENT_STATUS_PENDING = "pending"
    PAYMENT_STATUS_SUCCESS = "success"
    PAYMENT_STATUS_FAILED = "failed"
    PAYMENT_STATUS_REFUNDED = "refunded"
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PENDING, "Pending"),
        (PAYMENT_STATUS_SUCCESS, "Success"),
        (PAYMENT_STATUS_FAILED, "Failed"),
        (PAYMENT_STATUS_REFUNDED, "Refunded"),
    ]

    order = models.OneToOneField(Order, related_name="payment", on_delete=models.CASCADE)
    gateway = models.CharField(max_length=50)                     # e.g., 'sslcommerz'
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_STATUS_PENDING)
    raw_response = models.JSONField(null=True, blank=True)        # store payment gateway callback
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_refunded = models.BooleanField(default=False)

    def __str__(self):
        return f"Payment for {self.order.order_number} ({self.status})"
