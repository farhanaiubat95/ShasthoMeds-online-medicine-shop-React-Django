from rest_framework import serializers
from shasthomeds.settings import EMAIL_HOST_USER
from .models import CustomUser, EmailOTP
from django.contrib.auth.password_validation import validate_password
import random
from django.core.mail import send_mail

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # pyright: ignore[reportMissingImports]

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
            message=f"Hello {user.username},\n\n Thank you for registering with ShasthoMeds.\n\nYour OTP code is: {otp}.",
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
