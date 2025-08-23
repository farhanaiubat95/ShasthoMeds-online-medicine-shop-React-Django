from django.utils import timezone
import random
from django.core.mail import send_mail
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status

from .models import Brand, Cart, CartItem, Category, PrescriptionRequest,Product
from .serializers import BrandSerializer, CartSerializer, CategorySerializer, PrescriptionRequestSerializer,ProductSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from django.conf import settings

EMAIL_HOST_USER = settings.EMAIL_HOST_USER

# store/views.py
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import (
    CustomUser,
    EmailOTP,
)
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)


# pyright: ignore[reportMissingImports]
from rest_framework_simplejwt.views import TokenObtainPairView  # pyright: ignore[reportMissingImports]

# Protected view
from rest_framework.permissions import IsAuthenticated

# pyright: ignore[reportMissingImports]
from rest_framework_simplejwt.tokens import RefreshToken  # pyright: ignore[reportMissingImports]

# View to get API root
class APIRootView(APIView):
    def get(self, request):
        return Response({"message": "Welcome to ShasthoMeds Auth API"})
    
# View to register user
class RegisterAPIView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

# View to verify OTP
class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            otp_obj = EmailOTP.objects.get(user=user)
        except EmailOTP.DoesNotExist:
            return Response({'error': 'OTP not found'}, status=status.HTTP_404_NOT_FOUND)

        if otp_obj.otp_code != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_obj.is_expired():
            otp_obj.delete()  # Clean up expired OTPs
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.is_active = True
        user.save()
        otp_obj.delete()  # Delete OTP after successful verification

        return Response({'message': 'User verified successfully'}, status=status.HTTP_200_OK)

# View to resend OTP
class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)

            if user.is_verified:
                return Response({"message": "User is already verified."}, status=status.HTTP_400_BAD_REQUEST)

            # Generate new OTP
            otp = str(random.randint(100000, 999999))

            # Save or update the OTP record
            EmailOTP.objects.update_or_create(
                user=user,
                defaults={"otp_code": otp, "created_at": timezone.now()}
            )

            # Send OTP to user's email
            try:
                send_mail(
                    subject="Your New OTP for ShasthoMeds",
                    message=f"Your new OTP is: {otp}",
                    from_email=EMAIL_HOST_USER,
                    recipient_list=[email],
                )
            except Exception as e:
                return Response({"error": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"message": "OTP resent successfully."}, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

# View to obtain JWT token
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Protected view
class MyProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # from token
        return Response({"email": user.email, "username": user.username, "role": user.role, "id": user.id})

# View to logout
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"message": f"Token is invalid or already blacklisted: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    
# View to update profile
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully', 'user': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View to get all brands
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by("-created_at")
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # anyone can read, only logged-in users can create/update/delete

# View to get all categories
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("-created_at")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# View to get all products
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # anyone can read, only logged-in can create/update/delete

# ---------------- Cart ViewSet ----------------
class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        # Get or create cart for user
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def add(self, request):
        """
        Add product to cart.
        If prescription_required -> create PrescriptionRequest
        Else -> add directly to CartItem
        """
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        if not product_id:
            return Response({"error": "product_id is required"}, status=400)

        product = get_object_or_404(Product, id=product_id)

        # Case 1: Prescription NOT required
        if not product.prescription_required:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                cart_item.quantity += quantity
            else:
                cart_item.quantity = quantity
            cart_item.save()
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=201)

        # Case 2: Prescription required -> user should upload image
        return Response({"message": "Prescription required. Please upload image."}, status=200)


# ---------------- PrescriptionRequest ViewSet ----------------
class PrescriptionRequestViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionRequest.objects.all().order_by("-created_at")
    serializer_class = PrescriptionRequestSerializer

    def get_permissions(self):
        # Admins can list all requests, users can only create / list their own
        if self.action in ["list", "retrieve", "update", "partial_update", "destroy"]:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [p() for p in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, "role", None) == "admin":
            return PrescriptionRequest.objects.all()
        return PrescriptionRequest.objects.filter(user=user)

    def perform_update(self, serializer):
        # Prevent normal users from changing status
        if not self.request.user.is_staff and getattr(self.request.user, "role", None) != "admin":
            serializer.validated_data.pop("status", None)

        instance = serializer.save()   # save only once

        # ---------------- Handle status changes ----------------
        if instance.status == "approved":
            # Add product to cart
            cart, _ = Cart.objects.get_or_create(user=instance.user)
            cart_item, created = CartItem.objects.get_or_create(cart=cart, product=instance.product)
            if not created:
                cart_item.quantity += 1
            else:
                cart_item.quantity = 1
            cart_item.save()

            # Send approval email
            product_lines = [
                "Product Name | SKU | Quantity",
                "-----------------------------",
                f"{instance.product.name} | {instance.product.sku} | 1"
            ]
            product_table = "\n".join(product_lines)

            try:
                send_mail(
                    subject="Prescription Approved - ShasthoMeds",
                    message=f"Hi {instance.user.full_name},\n\n"
                            f"Your prescription request #{instance.id} has been approved.\n\n"
                            f"The item(s) were added to your cart.\n\n{product_table}\n\n"
                            f"Enjoy your medication!",
                    from_email=EMAIL_HOST_USER,
                    recipient_list=[instance.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print("Failed sending approval email:", str(e))

        elif instance.status == "rejected":
            # Send rejection email
            try:
                send_mail(
                    subject="Prescription Rejected - ShasthoMeds",
                    message=f"Hi {instance.user.full_name},\n\n"
                            f"Your prescription for {instance.product.name} was rejected.\n"
                            f"Reason: {instance.admin_comment or 'Not specified'}\n"
                            f"Try again later with a valid prescription.",
                    from_email=EMAIL_HOST_USER,
                    recipient_list=[instance.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print("Failed sending rejection email:", str(e))
