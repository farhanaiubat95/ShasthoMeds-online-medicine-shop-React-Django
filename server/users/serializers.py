from rest_framework import serializers
from shasthomeds.settings import EMAIL_HOST_USER
from django.contrib.auth.password_validation import validate_password
import random
from django.core.mail import send_mail
from .models import Brand, Category


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # pyright: ignore[reportMissingImports]

# Models
from .models import (
    CustomUser, EmailOTP,
    
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

        send_mail(
            subject='Your OTP Code from ShasthoMeds',
            message=f"Hello {user.username},\n\nThank you for registering with ShasthoMeds.\n\nYour OTP code is: {otp}.",
            from_email=EMAIL_HOST_USER,
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


# Serializer for Brand
class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "slug"]

    def validate_image(self, value):
        max_size_mb = 2
        if value.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f"Image size must not exceed {max_size_mb} MB.")
        return value


# Serializer for Category
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"