from datetime import timezone
import random
from django.core.mail import send_mail
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status

from django.conf import settings
EMAIL_HOST_USER = settings.EMAIL_HOST_USER

# store/views.py
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import (
    CustomUser, EmailOTP,
    Category, Brand, Product,
    PrescriptionRequest, PrescriptionItem,
    Cart, CartItem,
    Order, OrderItem, Payment
)
from .serializers import (
    CustomTokenObtainPairSerializer, UserProfileSerializer, UserRegistrationSerializer,
    CategorySerializer, BrandSerializer, ProductSerializer,
    PrescriptionRequestSerializer,
    CartSerializer
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
                defaults={"otp": otp, "created_at": timezone.now()}
            )

            # Send OTP to user's email
            send_mail(
                subject="Your New OTP for ShasthoMeds",
                message=f"Your new OTP is: {otp}",
                from_email=EMAIL_HOST_USER,
                recipient_list=[email],
            )

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
        return Response({"message": "You are authenticated!"})
    
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
            return Response({"message": "Logout successful"},status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"message": "Token is Blacklisted"},status=status.HTTP_400_BAD_REQUEST)
    

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


# --- Category / Brand / Product ViewSets ---
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]  # admin CRUD; you can relax list/retrieve later

@action(detail=False, methods=['post'], url_path='add/')
def add_category(self, request):
    serializer = self.get_serializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminUser]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]  # admin can create/update; you could allow read-only to anonymous

    def get_permissions(self):
        # allow non-admin to read/list
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


# --- Prescription endpoints ---
class PrescriptionRequestViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionRequest.objects.all().order_by('-created_at')
    serializer_class = PrescriptionRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admin can see all; users see their own
        if user.role == 'admin' or user.is_staff:
            return PrescriptionRequest.objects.all().order_by('-created_at')
        return PrescriptionRequest.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        # attach request.user as owner and send admin email
        pres = serializer.save(user=self.request.user, status=PrescriptionRequest.STATUS_PENDING)
        # send email to admin(s) - simple approach: send to settings.EMAIL_HOST_USER
        try:
            send_mail(
                subject=f"New Prescription Uploaded by {self.request.user.email}",
                message=f"A user uploaded a prescription (ID: {pres.id}). Please review in admin panel.",
                from_email=EMAIL_HOST_USER,
                recipient_list=[EMAIL_HOST_USER],  # for production, change to list of admin emails
                fail_silently=True
            )
        except Exception:
            pass


# Admin approve/reject endpoint (also can be in admin panel but exposed for API)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def prescription_action_view(request, pk):
    """
    POST body: {"action": "approve" | "reject", "admin_notes": "...", "auto_add_to_cart": true/false}
    """
    pres = get_object_or_404(PrescriptionRequest, pk=pk)
    data = request.data
    action = data.get('action')
    admin_notes = data.get('admin_notes', '')
    auto_add = data.get('auto_add_to_cart', pres.auto_add_to_cart)

    if action == 'approve':
        pres.status = PrescriptionRequest.STATUS_APPROVED
        pres.admin_notes = admin_notes
        pres.reviewed_by = request.user
        pres.approved_at = timezone.now()
        pres.auto_add_to_cart = bool(auto_add)
        pres.save()

        # Auto add items to user's active cart
        if pres.auto_add_to_cart:
            cart, _ = Cart.objects.get_or_create(user=pres.user, is_active=True)
            for item in pres.items.all():
                # if same product exists in cart, increment qty
                ci = CartItem.objects.filter(cart=cart, product=item.product).first()
                if ci:
                    ci.quantity += item.quantity
                    ci.save()
                else:
                    CartItem.objects.create(
                        cart=cart,
                        product=item.product,
                        quantity=item.quantity,
                        unit_price=item.product.get_price(),
                        prescription_request=pres
                    )

        # notify user
        try:
            send_mail(
                subject="Your prescription has been approved",
                message=f"Hello {pres.user.full_name},\n\nYour prescription (ID: {pres.id}) has been approved. Products have been added to your cart.",
                from_email=EMAIL_HOST_USER,
                recipient_list=[pres.user.email],
                fail_silently=True
            )
        except Exception:
            pass

        return Response({'message': 'Prescription approved'}, status=status.HTTP_200_OK)

    elif action == 'reject':
        pres.status = PrescriptionRequest.STATUS_REJECTED
        pres.admin_notes = admin_notes
        pres.reviewed_by = request.user
        pres.save()
        try:
            send_mail(
                subject="Your prescription was rejected",
                message=f"Hello {pres.user.full_name},\n\nYour prescription (ID: {pres.id}) was rejected. {admin_notes}",
                from_email=EMAIL_HOST_USER,
                recipient_list=[pres.user.email],
                fail_silently=True
            )
        except Exception:
            pass
        return Response({'message': 'Prescription rejected'}, status=status.HTTP_200_OK)

    return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


# --- Cart endpoints ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_or_create_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user, is_active=True)
    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """
    Payload:
    {
      "product_id": 1,
      "quantity": 2,
      "prescription_request_id": null  # optional if already uploaded
    }
    """
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    product = get_object_or_404(Product, pk=product_id)

    # if product requires prescription and no approved prescription exists -> require upload flow
    if product.prescription_required:
        # check if user has an approved prescription associated with this product
        approved = PrescriptionRequest.objects.filter(
            user=request.user,
            status=PrescriptionRequest.STATUS_APPROVED,
            items__product=product
        ).distinct()

        if approved.exists():
            # if approved, add directly to cart
            cart, _ = Cart.objects.get_or_create(user=request.user, is_active=True)
            ci, created = CartItem.objects.get_or_create(cart=cart, product=product, prescription_request=approved.first(), defaults={
                'quantity': quantity, 'unit_price': product.get_price()
            })
            if not created:
                ci.quantity += quantity
                ci.save()
            return Response({'message': 'Added to cart (approved prescription found).'}, status=status.HTTP_200_OK)

        # else: create a new prescription request placeholder if `prescription_request_id` provided then use it
        pres_id = request.data.get('prescription_request_id')
        if pres_id:
            pres = get_object_or_404(PrescriptionRequest, pk=pres_id, user=request.user)
            if pres.status == PrescriptionRequest.STATUS_APPROVED:
                # should have been caught earlier; still safe
                cart, _ = Cart.objects.get_or_create(user=request.user, is_active=True)
                CartItem.objects.create(cart=cart, product=product, quantity=quantity, unit_price=product.get_price(), prescription_request=pres)
                return Response({'message': 'Added to cart (prescription id provided and approved).'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Prescription pending approval. Admin will review.'}, status=status.HTTP_202_ACCEPTED)

        # no approved pres found and no pres id provided -> ask client to upload and create a prescription request
        # create a minimal PrescriptionRequest with no file (client should upload file in separate endpoint)
        temp_pres = PrescriptionRequest.objects.create(user=request.user, uploaded_file=None, status=PrescriptionRequest.STATUS_PENDING)
        PrescriptionItem.objects.create(prescription_request=temp_pres, product=product, quantity=quantity)
        # send mail to admin
        try:
            send_mail(
                subject=f"Prescription uploaded (auto) by {request.user.email}",
                message=f"User {request.user.email} wants to add product {product.name}. Prescription request id {temp_pres.id}. Please review.",
                from_email=EMAIL_HOST_USER,
                recipient_list=[EMAIL_HOST_USER],
                fail_silently=True
            )
        except Exception:
            pass
        return Response({'message': 'Prescription required. Created prescription request. Please upload file.', 'prescription_request_id': temp_pres.id}, status=status.HTTP_202_ACCEPTED)

    # If product does not require prescription -> normal add to cart
    cart, _ = Cart.objects.get_or_create(user=request.user, is_active=True)
    ci, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={
        'quantity': quantity, 'unit_price': product.get_price()
    })
    if not created:
        ci.quantity += quantity
        ci.save()
    return Response({'message': 'Added to cart'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_prescription_file(request, pres_id):
    """
    Upload file for an existing prescription request (created by add_to_cart).
    Use multipart/form-data with "uploaded_file".
    """
    pres = get_object_or_404(PrescriptionRequest, pk=pres_id, user=request.user)
    file = request.FILES.get('uploaded_file')
    if not file:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    pres.uploaded_file = file
    pres.status = PrescriptionRequest.STATUS_PENDING
    pres.save()
    # notify admin
    try:
        send_mail(
            subject=f"Prescription uploaded by {request.user.email}",
            message=f"Prescription request #{pres.id} has a file. Please review.",
            from_email=EMAIL_HOST_USER,
            recipient_list=[EMAIL_HOST_USER],
            fail_silently=True
        )
    except Exception:
        pass
    return Response({'message': 'File uploaded and admin notified'}, status=status.HTTP_200_OK)


# --- Order creation endpoint (from cart) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order_from_cart(request):
    """
    POST body:
    {
      "shipping_address": "...",
      "shipping_city": "...",
      "shipping_phone": "...",
      "postal_code": "...",
      "payment_method": "cod" | "online"
    }
    """
    user = request.user
    cart = Cart.objects.filter(user=user, is_active=True).first()
    if not cart or not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    payment_method = data.get('payment_method')
    if payment_method not in [Order.PAYMENT_COD, Order.PAYMENT_ONLINE]:
        return Response({'error': 'Invalid payment method'}, status=status.HTTP_400_BAD_REQUEST)

    # create order
    order = Order.objects.create(
        user=user,
        shipping_address=data.get('shipping_address', ''),
        shipping_city=data.get('shipping_city', ''),
        shipping_phone=data.get('shipping_phone', ''),
        postal_code=data.get('postal_code', ''),
        payment_method=payment_method,
        status=Order.STATUS_PENDING
    )

    total = Decimal('0.00')
    for ci in cart.items.all():
        subtotal = (ci.unit_price or Decimal('0.00')) * ci.quantity
        OrderItem.objects.create(
            order=order,
            product=ci.product,
            product_name=ci.product.name,
            quantity=ci.quantity,
            unit_price=ci.unit_price,
            subtotal=subtotal,
            prescription_request=ci.prescription_request
        )
        total += subtotal

    order.total_amount = total
    order.save()

    # create payment record
    payment = Payment.objects.create(
        order=order,
        gateway='cod' if payment_method == Order.PAYMENT_COD else 'sslcommerz',
        transaction_id=None,
        amount=order.total_amount,
        status=Payment.PAYMENT_STATUS_PENDING
    )

    # Clear cart
    cart.is_active = False
    cart.save()

    # If COD -> mark payment and order appropriately
    if payment_method == Order.PAYMENT_COD:
        payment.status = Payment.PAYMENT_STATUS_SUCCESS
        payment.paid_at = timezone.now()
        payment.save()
        order.payment_status = Order.PAYMENT_STATUS_PAID
        order.is_paid = False  # COD not paid yet (but you may mark differently)
        order.status = Order.STATUS_CONFIRMED
        order.save()
        # send email to user
        try:
            send_mail(
                subject=f"Order placed: {order.order_number}",
                message=f"Dear {user.full_name},\n\nYour order {order.order_number} has been placed (COD).",
                from_email=EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=True
            )
        except Exception:
            pass
        return Response({'message': 'Order placed (COD)', 'order_id': order.id}, status=status.HTTP_201_CREATED)

    # If online payment -> return payment.id and a redirect/url (placeholder) to perform payment on gateway
    if payment_method == Order.PAYMENT_ONLINE:
        # In production initiate gateway (sslcommerz) and send back redirect URL
        payment.status = Payment.PAYMENT_STATUS_PENDING
        payment.save()
        # placeholder url - frontend should redirect user to gateway with returned token
        gateway_redirect = f"https://example-payment-gateway/checkout?payment_id={payment.id}"
        return Response({'message': 'Redirect to payment gateway', 'payment_id': payment.id, 'redirect_url': gateway_redirect}, status=status.HTTP_200_OK)


# --- Payment callback (gateway webhook) ---
@api_view(['POST'])
@permission_classes([AllowAny])  # gateway will call this
def payment_callback(request):
    """
    Example: gateway posts JSON with {payment_id, status, transaction_id, raw}
    Implement according to gateway docs.
    """
    payment_id = request.data.get('payment_id')
    status_str = request.data.get('status')
    transaction_id = request.data.get('transaction_id')
    raw = request.data.get('raw_response', {})

    payment = get_object_or_404(Payment, pk=payment_id)
    payment.transaction_id = transaction_id
    payment.raw_response = raw
    if status_str in ['success', 'COMPLETED', 'SUCCESS']:
        payment.status = Payment.PAYMENT_STATUS_SUCCESS
        payment.paid_at = timezone.now()
        payment.save()
        order = payment.order
        order.payment_status = Order.PAYMENT_STATUS_PAID
        order.is_paid = True
        order.status = Order.STATUS_CONFIRMED
        order.save()
        # send mail to user
        try:
            send_mail(
                subject=f"Payment confirmed: {order.order_number}",
                message=f"Payment for order {order.order_number} received. Thank you.",
                from_email=EMAIL_HOST_USER,
                recipient_list=[order.user.email],
                fail_silently=True
            )
        except Exception:
            pass
        return Response({'message': 'Payment marked success'}, status=status.HTTP_200_OK)
    else:
        payment.status = Payment.PAYMENT_STATUS_FAILED
        payment.save()
        order = payment.order
        order.payment_status = Order.PAYMENT_STATUS_FAILED
        order.save()
        return Response({'message': 'Payment failed'}, status=status.HTTP_200_OK)

