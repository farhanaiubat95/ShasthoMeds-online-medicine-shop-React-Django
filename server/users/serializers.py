from rest_framework import serializers
from shasthomeds.settings import EMAIL_HOST_USER
from django.contrib.auth.password_validation import validate_password
import random
from django.core.mail import send_mail
from .models import Brand, Cart, CartItem,Category, PrescriptionRequest,Product
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  # pyright: ignore[reportMissingImports]

# Models
from .models import (
    CustomUser,
    EmailOTP,
)

# User registration serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'full_name', 'username', 'email', 'phone', 'gender',
            'date_of_birth', 'city', 'address', 'password', 'password2', 'is_verified', 'is_active', 'role'
        ]

    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if len(value) > 11:
            raise serializers.ValidationError("Phone number must not be more than 11 digits.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.pop('role', 'user')  # default to 'user' if not provided

        # Generate a random 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Create the user and set is_verified = False
        user = CustomUser.objects.create_user(
            full_name=validated_data['full_name'],
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            gender=validated_data['gender'],
            date_of_birth=validated_data['date_of_birth'],
            city=validated_data['city'],
            address=validated_data['address'],
            password=validated_data['password'],
            role=role,
            is_verified=False,
            is_active=False,
        )

        EmailOTP.objects.create(user=user, otp_code=otp)

        try:
            send_mail(
                subject='Your OTP Code from ShasthoMeds',
                message=f"Hello {user.username},\n\nThank you for registering with ShasthoMeds.\n\nYour OTP code is: {otp}.",
                from_email=EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False
            )
        except Exception as e:
            raise serializers.ValidationError(f"Failed to send OTP: {str(e)}")

        return user


# User login serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_verified:
            raise serializers.ValidationError("Please verify your email via OTP before logging in.")

        # Add user details to the token response (limit sensitive data)
        data.update({
            "user": {
                "id": self.user.id,
                "email": self.user.email,
                "username": self.user.username,
                "full_name": self.user.full_name,
                "phone": self.user.phone,
                "gender": self.user.gender,
                "date_of_birth": self.user.date_of_birth,
                "city": self.user.city,
                # Exclude 'address' unless needed
                "is_verified": self.user.is_verified,
                "role": self.user.role,
            }
        })

        return data
    

# Serializer to update user profile
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'full_name', 'username', 'phone', 'gender', 'date_of_birth',
            'city', 'address'
        ]


# Serializer for Brand
class BrandSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()  # override default field

    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "slug"]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url  # full Cloudinary URL
        return None
    # Removed validate_image as it's handled by model-level validator


# Serializer for Category
class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()  # override default field

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image", "parent", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "slug"]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url  # full Cloudinary URL
        return None

# Serializer for Product
class ProductSerializer(serializers.ModelSerializer):
    # Replace brand/category IDs with full nested objects
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    # Return full Cloudinary URLs
    image1 = serializers.SerializerMethodField()
    image2 = serializers.SerializerMethodField()
    image3 = serializers.SerializerMethodField()
    display_unit = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "slug", "new_price", "discount_price"]

    def get_image1(self, obj):
        if obj.image1:
            return obj.image1.url  # Cloudinary URL
        return None

    def get_image2(self, obj):
        if obj.image2:
            return obj.image2.url
        return None

    def get_image3(self, obj):
        if obj.image3:
            return obj.image3.url
        return None

    def get_display_unit(self, obj):
        return obj.display_unit()

    # Removed validate_imageX methods as they are handled by model-level validator


# Serializer for CartItem
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)   # show product details
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source="product"
    )

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "added_at"]


# Serializer for Cart
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


# Serializer for PrescriptionRequest
from django.core.mail import send_mail
from shasthomeds.settings import EMAIL_HOST_USER

class PrescriptionRequestSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source="product"
    )
    uploaded_image = serializers.ImageField(write_only=True)  # for upload only

    class Meta:
        model = PrescriptionRequest
        fields = [
            "id", "user", "product", "product_id",
            "uploaded_image", "notes",
            "status", "admin_comment",
            "created_at", "reviewed_at",
        ]
        read_only_fields = ["id", "user", "status", "admin_comment", "created_at", "reviewed_at"]

    def to_representation(self, instance):
        """Override representation to return Cloudinary URL for uploaded_image"""
        ret = super().to_representation(instance)
        if instance.uploaded_image:
            ret['uploaded_image'] = instance.uploaded_image.url  # Cloudinary URL
        else:
            ret['uploaded_image'] = None
        return ret


    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        prescription = super().create(validated_data)

        # --- Send email to admin when new request submitted ---
        admin_email = EMAIL_HOST_USER
        
        # Format product list as table
        product_lines = [
        "Product Name | SKU | Quantity",
        "-----------------------------"
        ]
        product = prescription.product
        product_lines.append(f"{product.name} | {product.sku} | 1")  # default qty = 1

        product_table = "\n".join(product_lines)
        try:
            send_mail(
                subject=f"New Prescription Request #{prescription.id}",
                message=(
                    f"User {user.username} has uploaded a new prescription.\n\n"
                    f"Products:\n{product_table}\n\n"
                    f"Please review it."
                ),
                from_email=EMAIL_HOST_USER,
                recipient_list=[admin_email],
                fail_silently=False
                )
        except Exception as e:
            print("Failed to send admin email:", str(e))

        return prescription
