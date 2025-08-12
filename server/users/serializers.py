from rest_framework import serializers
from shasthomeds.settings import EMAIL_HOST_USER
from django.contrib.auth.password_validation import validate_password
import random
from django.core.mail import send_mail

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # pyright: ignore[reportMissingImports]

# Models
from .models import (
    CustomUser, EmailOTP,
    Category, Brand, Product,
    PrescriptionRequest, PrescriptionItem,
    Cart, CartItem,
    Order, OrderItem, Payment
)
from users.models import CustomUser  # or from .models import CustomUser if in same app

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

        # For now, we will just print the OTP to console.
        # Later we will send this via SMS/email
        # print(f"OTP for user {user.phone}: {otp}")

        send_mail(
            subject='Your OTP Code from ShasthoMeds',
            message=f"Hello {user.full_name},\n\n Thank you for registering with ShasthoMeds.\n\nYour OTP code is: {otp}.",
            from_email=EMAIL_HOST_USER ,
            recipient_list=[user.email],
            fail_silently=False
        )

        return user

# User login serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_verified:
            raise serializers.ValidationError("Please verify your email via OTP before logging in.")

        # Add user details to the token response
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


# --- Category / Brand / Product ---
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'image', 'is_active', 'created_at', 'updated_at']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'image', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Category.objects.all(), source='category')
    brand_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Brand.objects.all(), source='brand', allow_null=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'slug', 'description', 'category', 'brand',
            'category_id', 'brand_id',
            'price','offer_percentage','new_price','discount_price', 'stock', 'unit', 'prescription_required',
            'image1', 'image2', 'image3', 'is_active', 'created_at', 'updated_at'
        ]


# --- Prescription request & items ---
class PrescriptionItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Product.objects.all(), source='product')

    class Meta:
        model = PrescriptionItem
        fields = ['id', 'product', 'product_id', 'quantity', 'note']


class PrescriptionRequestSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=CustomUser.objects.all(), source='user', required=False)
    items = PrescriptionItemSerializer(many=True)
    uploaded_file = serializers.FileField(required=True)

    class Meta:
        model = PrescriptionRequest
        fields = [
            'id', 'user', 'user_id', 'status', 'uploaded_file', 'notes', 'admin_notes',
            'reviewed_by', 'created_at', 'updated_at', 'approved_at', 'items', 'auto_add_to_cart'
        ]
        read_only_fields = ['status', 'reviewed_by', 'approved_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        # user will be set from view (request.user) if not provided
        pres = PrescriptionRequest.objects.create(**validated_data)
        for it in items_data:
            PrescriptionItem.objects.create(prescription_request=pres, **it)
        return pres


# --- Cart and CartItem ---
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Product.objects.all(), source='product')
    prescription_request = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'product_id', 'quantity', 'unit_price', 'prescription_request', 'added_at']
        read_only_fields = ['unit_price', 'added_at', 'prescription_request']

    def create(self, validated_data):
        # snapshot price
        product = validated_data['product']
        validated_data['unit_price'] = product.get_price()
        return super().create(validated_data)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'is_active', 'created_at', 'updated_at', 'expires_at', 'items']


# --- Order / OrderItem / Payment ---
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal', 'prescription_request', 'created_at']
        read_only_fields = ['product_name', 'unit_price', 'subtotal', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id','order_number','user','status','total_amount','shipping_address','shipping_city','shipping_phone',
            'postal_code','payment_method','payment_status','placed_at','updated_at','cancelled_at','admin_note','is_paid','delivery_option','tracking_number','items'
        ]
        read_only_fields = ['order_number', 'placed_at', 'updated_at', 'total_amount']

class PaymentSerializer(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())
    class Meta:
        model = Payment
        fields = ['id', 'order', 'gateway', 'transaction_id', 'amount', 'status', 'raw_response', 'paid_at', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
