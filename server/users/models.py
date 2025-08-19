from cloudinary.models import CloudinaryField
import cloudinary
import cloudinary.api
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ValidationError
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
    


# Image size validator
def validate_image_size(image):
    if not image:
        return  # allow blank
    max_size = 2 * 1024 * 1024  # 2 MB
    if image.size > max_size:
        raise ValidationError("Image size must be 2 MB or less.")
    public_id = image.name.rsplit('.', 1)[0]  # remove extension
    try:
        res = cloudinary.api.resource(public_id)
        # If resource exists, you can log or return True
        print("Image already uploaded:", res['url'])
    except cloudinary.exceptions.NotFound:
        print("Image not found on Cloudinary, will be uploaded.")

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

        super().save(*args, **kwargs)

        # Debug stock after save
        print("After save -> Stock:", self.stock)

    def display_unit(self):
        """Return the unit with its value if available"""
        if self.unit_value:
            return f"{self.unit_value} {self.get_unit_display()}"
        return self.get_unit_display()

    def __str__(self):
        return f"{self.name} ({self.sku})"