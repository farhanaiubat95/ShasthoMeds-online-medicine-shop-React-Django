from django.utils import timezone
from rest_framework import serializers
from shasthomeds.settings import EMAIL_HOST_USER
from django.contrib.auth.password_validation import validate_password
import random
from django.core.mail import send_mail
from .models import Brand, Cart, CartItem,Category, Order, OrderItem, PrescriptionRequest,Product
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
                "address": self.user.address,
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
    total_items = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id", "user","total_items", "total_quantity", "total_price",
            "created_at", "updated_at","items"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_total_items(self, obj):
        """Number of distinct cart items"""
        return obj.items.count()

    def get_total_quantity(self, obj):
        """Sum of quantities across all items"""
        return sum(item.quantity for item in obj.items.all())

    def get_total_price(self, obj):
        """Sum of product price × quantity"""
        total = 0
        for item in obj.items.all():
            if item.product and item.product.price:
                total += float(item.product.price) * item.quantity
        return round(total, 2)


# Serializer for PrescriptionRequest
class PrescriptionRequestSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # show full product details
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source="product"
    )
    uploaded_image = serializers.ImageField(write_only=True)  # user uploads image

    class Meta:
        model = PrescriptionRequest
        fields = [
            "id", "user", "product", "product_id",
            "uploaded_image", "notes",
            "status", "admin_comment",
            "created_at", "reviewed_at",
        ]
        read_only_fields = ["id", "user", "created_at", "reviewed_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")

        # Normal users cannot edit status/admin_comment
        if request and not (request.user.is_staff or getattr(request.user, "role", "") == "admin"):
            self.fields["status"].read_only = True
            self.fields["admin_comment"].read_only = True

    def to_representation(self, instance):
        """Return Cloudinary URL for uploaded_image instead of file path"""
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

        # --- Send email to admin when a new request is submitted ---
        admin_email = EMAIL_HOST_USER

        product_lines = [
            "Product Name | SKU | Quantity",
            "-----------------------------"
        ]
        product = prescription.product
        product_lines.append(f"{product.name} | {product.sku} | 1")

        product_table = "\n".join(product_lines)
        try:
            send_mail(
                subject=f"New Prescription Request #{prescription.id}",
                message=(
                    f"User {user.username} has uploaded a new prescription.\n\n"
                    f"Products:\n{product_table}\n\n"
                    f"Please review it in the admin panel."
                ),
                from_email=EMAIL_HOST_USER,
                recipient_list=[admin_email],
                fail_silently=False
            )
        except Exception as e:
            print("Failed to send admin email:", str(e))

        return prescription

    def update(self, instance, validated_data):
        """
        When admin updates a prescription (approve/reject),
        automatically set reviewed_at timestamp
        and trigger model logic.
        """
        new_status = validated_data.get("status", instance.status)

        if new_status != instance.status:
            instance.reviewed_at = timezone.now()

            if new_status == "approved":
                instance.approve()   # calls your model method
                return instance  # approve() already deletes request
            elif new_status == "rejected":
                instance.reject()    # calls your model method
                return instance

        return super().update(instance, validated_data)
    
    
# Serializer for Order
class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()
    product_name  = serializers.CharField()
    
    class Meta:
        model = OrderItem
        fields = ('product_id', 'product_name', 'quantity', 'price', 'subtotal')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data['product_name'],
                quantity=item_data['quantity'],
                price=item_data['price'],
                subtotal=item_data['subtotal']
            )
        return order
