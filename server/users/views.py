from django.utils import timezone
import random
from django.core.mail import send_mail
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings
from .SSLCOMMERZ import create_payment_session

from django.utils.crypto import get_random_string

from .models import Brand, Cart, CartItem, Category, Order, PrescriptionRequest,Product
from .serializers import BrandSerializer, CartSerializer, CategorySerializer, OrderSerializer, PrescriptionRequestSerializer,ProductSerializer

from django.conf import settings

EMAIL_HOST_USER = settings.EMAIL_HOST_USER

# store/views.py
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404


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
    permission_classes = [permissions.IsAuthenticated]

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


    @action(detail=False, methods=["delete"])
    def remove(self, request):
        cart_item_id = request.data.get("cart_item_id")
        if not cart_item_id:
            return Response({"error": "cart_item_id is required"}, status=400)

        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart__user=request.user)
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- PrescriptionRequest ViewSet ----------------
class PrescriptionRequestViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionRequest.objects.all().order_by("-created_at")
    serializer_class = PrescriptionRequestSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            updated_instance = serializer.save()
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------- Order ViewSet ----------------

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        payment_method = data.get("payment_method")

        # COD: Just save order directly
        if payment_method == "cod":
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            order = serializer.save()

            # Send email to customer
            try:
                product_list = "\n".join(
                    [f"{item.product.name} x {item.quantity}" for item in order.items.all()]
                )
                send_mail(
                    subject=f"Order Confirmation - #{order.id}",
                    message=f"Dear {order.name},\n\nThank you for your order.\n\n"
                        f"Order Details:\n{product_list}\n\n"
                        f"Total Amount: {order.total_amount} BDT\n\n"
                        "We will notify you once your order is shipped.\n\n"
                        "Thanks,\nShasthoMeds",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[order.email],
                )
            except Exception as e:
                # Optional: log the email error
                print(f"Error sending email: {str(e)}")
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        # Card Payment: Generate tran_id + call SSLCOMMERZ
        elif payment_method == "card":
            # Generate tran_id
            tran_id = get_random_string(16)
            data["tran_id"] = tran_id

            # Save order in DB
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            order = serializer.save()

            # Send email to customer
            try:
                product_list = "\n".join(
                    [f"{item.product.name} x {item.quantity}" for item in order.items.all()]
                )
                send_mail(
                    subject=f"Order Confirmation - #{order.id}",
                    message=f"Dear {order.name},\n\nThank you for your order.\n\n"
                            f"Order Details:\n{product_list}\n\n"
                            f"Total Amount: {order.total_amount} BDT\n\n"
                            "We will notify you once your order is shipped.\n\n"
                            "Thanks,\nShasthoMeds",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[order.email],
                )
            except Exception as e:
                # Optional: log the email error
                print(f"Error sending email: {str(e)}")

            # Call create_payment_session with your order data
            ssl_response = create_payment_session(
                amount=order.total_amount,
                tran_id=order.tran_id,
                success_url="https://shasthomeds-online.onrender.com/payment-success",
                fail_url="https://shasthomeds-online.onrender.com/payment-fail",
                cancel_url="https://shasthomeds-online.onrender.com/payment-cancel",
                customer_name=order.name,
                customer_email=order.email,
                customer_phone=order.phone,
                product_name="Order #" + str(order.id),
                product_category="General",
            )

            # Return SSLCommerz session response to frontend
            return Response(ssl_response, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Invalid payment method"}, status=status.HTTP_400_BAD_REQUEST)

