from cloudinary.models import CloudinaryField
from cloudinary_storage.storage import RawMediaCloudinaryStorage
import cloudinary
import cloudinary.api
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

from django.core.mail import send_mail
from shasthomeds.settings import EMAIL_HOST_USER

# store/models.py
from uuid import uuid4
from decimal import Decimal, InvalidOperation
from django.utils.text import slugify

from django.core.validators import MinValueValidator


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
    


# Image size validator
def validate_image_size(image):
    if not image:
        return

    max_size = 2 * 1024 * 1024  # 2 MB

    try:
        # Cloudinary stores file metadata, fetch it
        public_id = image.public_id if hasattr(image, "public_id") else str(image).rsplit(".", 1)[0]
        resource = cloudinary.api.resource(public_id)
        size_in_bytes = resource.get("bytes", 0)

        if size_in_bytes > max_size:
            raise ValidationError("Image size must be 2 MB or less.")

    except cloudinary.exceptions.NotFound:
        # image not yet uploaded, skip check
        pass
    except Exception as e:
        # fallback if API call fails
        print("Cloudinary validation error:", e)
        pass

# Brand model
class Brand(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True, blank=True)
    image = CloudinaryField('image', folder='brands', null=True, blank=True, validators=[validate_image_size])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            while Brand.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{uuid4().hex[:6]}"
                self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# Category model
class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    image = CloudinaryField('image', folder='categories', validators=[validate_image_size], null=True, blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
# Product model
class Product(models.Model):
    UNIT_CHOICES = (
        ('pcs', 'Pieces'),
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('bottle', 'Bottle'),
    )

    WEIGHT_CHOICES = (
        ("mg", "mg"),
        ("ml", "ml"),
        ("g", "g"),
    )

    PACKAGE_CHOICES = (
        ('strip', '1 Strip'),
        ('box', '1 Box'),
        ('pack', '1 Pack'),
    )

    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)

    # Medical-specific fields
    generic_name = models.CharField(max_length=255, blank=True)
    indication = models.TextField(blank=True)
    adult_dose = models.TextField(blank=True)
    child_dose = models.TextField(blank=True)
    contraindication = models.TextField(blank=True)
    precaution = models.TextField(blank=True)
    side_effect = models.TextField(blank=True)

    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name="products")
    brand = models.ForeignKey('Brand', on_delete=models.SET_NULL, null=True, blank=True, related_name="products")

    price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    offer_price = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    stock = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, choices=UNIT_CHOICES, default='pcs')
    unit_value = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Specify the quantity or volume (e.g., '5 ml', '2 tablets')"
    )

    # Weight fields
    weight_value = models.PositiveIntegerField(blank=True, null=True)
    weight_unit = models.CharField(max_length=10, choices=WEIGHT_CHOICES, blank=True, null=True)

    # NEW stored fields
    weight_display = models.CharField(max_length=50, blank=True, null=True)
    unit_display = models.CharField(max_length=50, blank=True, null=True)

    # Package quantity (like 1 strip / 1 box)
    package_quantity = models.CharField(max_length=20, choices=PACKAGE_CHOICES, blank=True, null=True)

    prescription_required = models.BooleanField(default=False)

    image1 = CloudinaryField('image1', folder='products', validators=[validate_image_size])
    image2 = CloudinaryField('image2', folder='products', null=True, blank=True, validators=[validate_image_size])
    image3 = CloudinaryField('image3', folder='products', null=True, blank=True, validators=[validate_image_size])

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        # Debug stock before save
        print("Before save -> Stock:", self.stock)

        # Auto-generate slug if blank
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{uuid4().hex[:6]}"
            self.slug = slug

        # Calculate new_price and discount_price
        if self.offer_price and self.offer_price > 0:
            self.new_price = self.price - (self.price * self.offer_price / 100)
            self.discount_price = self.price - self.new_price
        else:
            self.new_price = self.price
            self.discount_price = 0

        # Determine package_quantity automatically
        if self.unit == 'tablet' or self.unit == 'capsule':
            self.package_quantity = 'strip'
        elif self.unit == 'bottle':
            self.package_quantity = 'box'
        else:
            self.package_quantity = None
        
        # auto-generate display fields before saving
        if self.weight_value and self.weight_unit:
            self.weight_display = f"{self.weight_value} {self.weight_unit}"
        else:
            self.weight_display = None

        if self.unit_value and self.unit:
            self.unit_display = f"{self.unit_value} {self.get_unit_display()}"
        elif self.unit:
            self.unit_display = self.get_unit_display()
        else:
            self.unit_display = None

        super().save(*args, **kwargs)

        # Debug stock after save
        print("After save -> Stock:", self.stock)

    def display_unit(self):
        """Return the unit with its value if available"""
        if self.unit_value:
            return f"{self.unit_value} {self.get_unit_display()}"
        return self.get_unit_display()
    
    def display_weight(self):
        """Return weight_value + weight_unit (e.g., '500 mg')"""
        if self.weight_value and self.weight_unit:
            return f"{self.weight_value} {self.weight_unit}"
        return None  # or return "-" if want a default

    def __str__(self):
        return f"{self.name} ({self.sku})"



# =========================
# PRESCRIPTION & CART MODELS
# =========================

class Cart(models.Model):
    """
    A user's shopping cart.
    We keep exactly one active cart per user. Old carts can be closed or expired.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="carts")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            # Ensure only one active cart per user (soft constraint; enforced in code too)
            models.UniqueConstraint(
                fields=["user"], condition=models.Q(is_active=True), name="uniq_active_cart_per_user"
            )
        ]

    def __str__(self):
        return f"Cart #{self.id} for {self.user.email} (active={self.is_active})"

    @staticmethod
    def get_or_create_active(user):
        """
        Reuse an existing active cart or create a fresh one.
        """
        cart, _ = Cart.objects.get_or_create(user=user, is_active=True)
        return cart


# Prescription request
class PrescriptionRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="prescription_requests")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    uploaded_image = CloudinaryField("image", folder="prescriptions", null=True, blank=True, validators=[validate_image_size])
    uploaded_file = models.FileField(storage=RawMediaCloudinaryStorage(), upload_to="prescriptions/", null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_prescriptions")
    auto_add_to_cart = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"PrescriptionRequest #{self.id} by {self.user.email} [{self.status}]"

    # ------------------
    # Approve / Reject
    # ------------------
    def approve(self, reviewer=None, admin_notes=None):
        if self.status == self.STATUS_APPROVED:
            return

        self.status = self.STATUS_APPROVED
        self.approved_at = timezone.now()
        if reviewer:
            self.reviewed_by = reviewer
        if admin_notes is not None:
            self.admin_notes = admin_notes
        self.save()

        # Add to cart if enabled
        if self.auto_add_to_cart:
            cart = Cart.get_or_create_active(self.user)
            for item in self.items.all():
                product = item.product
                unit_price = product.new_price if product.new_price and product.new_price > 0 else product.price
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    defaults={
                        "quantity": item.quantity,
                        "unit_price": unit_price,
                        "prescription_request": self,
                    },
                )
                if not created:
                    cart_item.quantity = models.F("quantity") + item.quantity
                    cart_item.prescription_request = self
                    cart_item.save(update_fields=["quantity", "prescription_request"])

        # Send approval email to user
        product_lines = ["Product Name | SKU | Quantity", "-----------------------------"]
        for item in self.items.all():
            product_lines.append(f"{item.product.name} | {item.product.sku} | {item.quantity}")

        product_table = "\n".join(product_lines)

        try:
            send_mail(
                subject=f"Prescription Request #{self.id} Approved",
                message=f"Hello {self.user.username},\n\nYour prescription request has been approved by the admin.\n\nProducts:\n{product_table}\n\nThank you for using ShasthoMeds!",
                from_email=EMAIL_HOST_USER,
                recipient_list=[self.user.email],
                fail_silently=False
            )
        except Exception as e:
            print("Failed to send approval email:", e)

    def reject(self, reviewer=None, admin_notes=None):
        self.status = self.STATUS_REJECTED
        if reviewer:
            self.reviewed_by = reviewer
        if admin_notes is not None:
            self.admin_notes = admin_notes
        self.save()

        # Send rejection email to user
# Format product list
        product_lines = ["Product Name | SKU | Quantity", "-----------------------------"]
        for item in self.items.all():
            product_lines.append(f"{item.product.name} | {item.product.sku} | {item.quantity}")

        product_table = "\n".join(product_lines)

        try:
            send_mail(
                subject=f"Prescription Request #{self.id} Rejected",
                message=f"Hello {self.user.username},\n\nYour prescription request has been rejected.\n\nProducts:\n{product_table}\n\nNotes from admin: {self.admin_notes or 'None'}",
                from_email=EMAIL_HOST_USER,
                recipient_list=[self.user.email],
                fail_silently=False
            )
        except Exception as e:
            print("Failed to send rejection email:", e)


# Prescription item
class PrescriptionItem(models.Model):
    """
    Individual item (product + qty) contained in a PrescriptionRequest.
    """
    prescription_request = models.ForeignKey(PrescriptionRequest, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="prescription_items")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} (Req #{self.prescription_request_id})"


class CartItem(models.Model):
    """
    A product entry inside a cart.
    'prescription_request' is set when this cart item came from an approved prescription.
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    prescription_request = models.ForeignKey(
        PrescriptionRequest, null=True, blank=True, on_delete=models.SET_NULL, related_name="cart_items"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("cart", "product")  # merge quantities instead of duplicates
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.product.name} x {self.quantity} (Cart #{self.cart_id})"
