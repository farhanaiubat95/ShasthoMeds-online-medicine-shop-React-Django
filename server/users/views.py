from django.utils import timezone
import random
from django.core.mail import send_mail
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.db import transaction

from django.db import models

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Brand, Cart, CartItem, Category, PrescriptionRequest, Product
from .serializers import BrandSerializer, CartSerializer, CategorySerializer, PrescriptionRequestCreateSerializer, PrescriptionRequestSerializer, ProductSerializer
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
from users.models import CustomUser

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




# =========================
# PRESCRIPTION & CART VIEWS
# =========================


def _get_effective_price(product):
    # Helper: choose discounted price if set, else base price
    return product.new_price if product.new_price and product.new_price > 0 else product.price


class CartViewSet(viewsets.ViewSet):
    """
    Simple cart endpoints:
    - GET /cart/           -> get my active cart
    - POST /cart/add/      -> add product (handles prescription vs non-prescription)
    - POST /cart/item/{id}/update_qty/ -> update quantity
    - POST /cart/item/{id}/remove/     -> remove item
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart = Cart.get_or_create_active(request.user)
        data = CartSerializer(cart).data
        return Response(data)

    @action(detail=False, methods=["post"], url_path="add", parser_classes=[MultiPartParser, FormParser, JSONParser])
    @transaction.atomic
    def add_to_cart(self, request):
        """
        Smart add-to-cart:
        - If product.prescription_required == False -> add immediately to cart.
        - If True -> requires uploaded_image or uploaded_file; creates PrescriptionRequest and notifies admin.
        Request fields:
          product_id (required)
          quantity (default 1)
          uploaded_image (optional file)
          uploaded_file (optional file)
          notes (optional)
          auto_add_to_cart (optional, default True)
        """
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        notes = request.data.get("notes", "")
        auto_add_to_cart = str(request.data.get("auto_add_to_cart", "true")).lower() != "false"

        if not product_id:
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        if not product.prescription_required:
            # Normal add-to-cart
            cart = Cart.get_or_create_active(request.user)
            unit_price = _get_effective_price(product)
            item, created = CartItem.objects.get_or_create(
                cart=cart, product=product,
                defaults={"quantity": quantity, "unit_price": unit_price}
            )
            if not created:
                item.quantity = models.F("quantity") + quantity
                item.save(update_fields=["quantity"])
            return Response({"message": "Added to cart", "cart": CartSerializer(cart).data}, status=status.HTTP_200_OK)

        # Prescription-required branch
        uploaded_image = request.data.get("uploaded_image")
        uploaded_file = request.data.get("uploaded_file")

        if not uploaded_image and not uploaded_file:
            # Tell the client to show the upload UI
            return Response(
                {"error": "This product requires a valid prescription. Please upload an image or PDF."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create prescription request + line item
        presc_serializer = PrescriptionRequestCreateSerializer(
            data={
                "uploaded_image": uploaded_image,
                "uploaded_file": uploaded_file,
                "notes": notes,
                "auto_add_to_cart": auto_add_to_cart,
                "items": [{"product": product.id, "quantity": quantity}],
            },
            context={"request": request},
        )
        presc_serializer.is_valid(raise_exception=True)
        presc = presc_serializer.save()

        # Notify admin via email
        try:
            admin_recipient = getattr(settings, "ADMIN_EMAIL", None) or EMAIL_HOST_USER
            send_mail(
                subject="New Prescription Request Submitted",
                message=(
                    f"User: {request.user.email}\n"
                    f"Request ID: {presc.id}\n"
                    f"Product: {product.name}\n"
                    f"Qty: {quantity}\n"
                    f"View in Admin: /admin/ (PrescriptionRequest #{presc.id})"
                ),
                from_email=EMAIL_HOST_USER,
                recipient_list=[admin_recipient],
                fail_silently=True,
            )
        except Exception as e:
            # Do not fail the API because of email issues
            print("Email error:", e)

        return Response(
            {"message": "Prescription submitted. Awaiting admin review.", "prescription_request_id": presc.id},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="item/(?P<item_id>[^/.]+)/update_qty")
    @transaction.atomic
    def update_qty(self, request, item_id=None):
        qty = int(request.data.get("quantity", 1))
        item = get_object_or_404(CartItem, id=item_id, cart__user=request.user, cart__is_active=True)
        if qty < 1:
            return Response({"error": "Quantity must be >= 1"}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = qty
        item.save(update_fields=["quantity"])
        return Response({"message": "Quantity updated"})

    @action(detail=False, methods=["post"], url_path="item/(?P<item_id>[^/.]+)/remove")
    @transaction.atomic
    def remove_item(self, request, item_id=None):
        item = get_object_or_404(CartItem, id=item_id, cart__user=request.user, cart__is_active=True)
        item.delete()
        return Response({"message": "Item removed"})


class PrescriptionRequestViewSet(viewsets.ModelViewSet):
    """
    Endpoints for users to view their own requests, and for admins to approve/reject.
    - GET /prescriptions/requests/           -> list my requests (user)
    - POST /prescriptions/requests/          -> create with file upload (user)
    - POST /prescriptions/requests/{id}/approve/  -> admin-only
    - POST /prescriptions/requests/{id}/reject/   -> admin-only
    """
    queryset = PrescriptionRequest.objects.select_related("user", "reviewed_by").prefetch_related("items__product")
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action in ["create"]:
            return PrescriptionRequestCreateSerializer
        return PrescriptionRequestSerializer

    def get_queryset(self):
        user = self.request.user
        # Non-admins can only see their own requests
        if not user.is_staff and getattr(user, "role", "") != "admin":
            return self.queryset.filter(user=user)
        # Admins can see all
        return self.queryset

    def perform_create(self, serializer):
        # The create() in serializer already ties to request.user; this ensures consistency
        serializer.save()

        # Notify admin (same as in add_to_cart flow when created separately)
        try:
            admin_recipient = getattr(settings, "ADMIN_EMAIL", None) or EMAIL_HOST_USER
            send_mail(
                subject="New Prescription Request Submitted",
                message=f"User: {self.request.user.email}\nRequest ID: {serializer.instance.id}",
                from_email=EMAIL_HOST_USER,
                recipient_list=[admin_recipient],
                fail_silently=True,
            )
        except Exception as e:
            print("Email error:", e)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        presc = self.get_object()
        presc.approve(reviewer=request.user, admin_notes=request.data.get("admin_notes", ""))

        # Notify user
        try:
            send_mail(
                subject="Your prescription was approved",
                message=f"Your prescription request #{presc.id} has been approved and the item(s) were added to your cart.",
                from_email=EMAIL_HOST_USER,
                recipient_list=[presc.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print("Email error:", e)

        return Response({"message": "Approved and added to cart"})

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        presc = self.get_object()
        presc.reject(reviewer=request.user, admin_notes=request.data.get("admin_notes", ""))

        # Notify user
        try:
            send_mail(
                subject="Your prescription was rejected",
                message=f"Your prescription request #{presc.id} was rejected. Please re-upload a clear/valid prescription.",
                from_email=EMAIL_HOST_USER,
                recipient_list=[presc.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print("Email error:", e)

        return Response({"message": "Rejected"})
