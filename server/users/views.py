import uuid
from django.utils import timezone
import random
from django.core.mail import send_mail
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from django.conf import settings

from users.helpers import get_available_time_slots
from .SSLCOMMERZ import create_payment_session

from django.utils.crypto import get_random_string
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Appointment, Brand, Cart, CartItem, Category, Doctor, MonthlyReport, Order, OrderItem, PrescriptionRequest,Product, YearlyReport,  Appointment, Doctor
from .serializers import AppointmentSerializer, BrandSerializer, CartSerializer, CategorySerializer, DoctorSerializer, MonthlyReportSerializer, OrderSerializer, PrescriptionRequestSerializer,ProductSerializer, YearlyReportSerializer
from datetime import datetime, timedelta
from django.db.models import Sum, F
from rest_framework.decorators import api_view, permission_classes
from django.http import HttpResponse
import csv

# store/views.py
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from datetime import date, timedelta
from django.conf import settings

EMAIL_HOST_USER = settings.EMAIL_HOST_USER


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


# Admin: Get all users
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all().order_by('-id')
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAdminUser]   # only admins can access


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
    parser_classes = [MultiPartParser, FormParser]   # ADD THIS

# View to get all categories
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("-created_at")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]   # ADD THIS

# View to get all products
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # anyone can read, only logged-in can create/update/delete
    parser_classes = [MultiPartParser, FormParser]

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
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Admin gets all orders
            return Order.objects.all().order_by('-created_at')
        # Regular users only see their own orders
        return Order.objects.filter(user=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        data = request.data
        payment_method = data.get("payment_method")

        # COD: Just save order directly
        if payment_method == "cod":
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            order = serializer.save()

            try:
                cart = Cart.objects.get(user=request.user)
                cart.items.all().delete()  # Delete all CartItem(s)
                cart.delete()  # Optional: delete the empty cart itself
            except Cart.DoesNotExist:
                pass  # User had no cart, nothing to delete

            # Reduce product stock
            for item in order.items.all():
                product = item.product
                if product.stock >= item.quantity:
                    product.stock -= item.quantity
                    product.save()
                else:
                # Optional: handle out-of-stock scenario
                    print(f"Not enough stock for {product.name}")
            

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
                    from_email=EMAIL_HOST_USER,
                    recipient_list=[order.email],
                )
            except Exception as e:
                # Optional: log the email error
                print(f"Error sending email: {str(e)}")
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        # Card Payment: Generate tran_id + call SSLCOMMERZ
        elif payment_method == "card":
           # Generate unique tran_id
            tran_id = f"TRANS{uuid.uuid4().hex[:6].upper()}"
            data["tran_id"] = tran_id

            # Save order in DB
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            order = serializer.save()

            try:
                cart = Cart.objects.get(user=request.user)
                cart.items.all().delete()  # Delete all CartItem(s)
                cart.delete()  # Optional: delete the empty cart itself
            except Cart.DoesNotExist:
                pass  # User had no cart, nothing to delete

            # Reduce product stock
            for item in order.items.all():
                product = item.product
                if product.stock >= item.quantity:
                    product.stock -= item.quantity
                    product.save()
                else:
                # Optional: handle out-of-stock scenario
                    print(f"Not enough stock for {product.name}")

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
                    from_email=EMAIL_HOST_USER,
                    recipient_list=[order.email],
                )
            except Exception as e:
                # Optional: log the email error
                print(f"Error sending email: {str(e)}")

            # Call create_payment_session with your order data
            ssl_response = create_payment_session(
                amount=order.total_amount,
                tran_id=order.tran_id,
                success_url="https://shasthomeds-backend.onrender.com/payment/success/",
                fail_url="https://shasthomeds-backend.onrender.com/payment/fail/",
                cancel_url="https://shasthomeds-backend.onrender.com/payment/cancel/",
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


# List all monthly reports
class MonthlyReportListView(generics.ListAPIView):
    queryset = MonthlyReport.objects.all().order_by('-month')
    serializer_class = MonthlyReportSerializer

# Get a single monthly report by month (YYYY-MM)
class MonthlyReportDetailView(generics.RetrieveAPIView):
    queryset = MonthlyReport.objects.all()
    serializer_class = MonthlyReportSerializer
    lookup_field = 'month'  # frontend can pass month=2025-09-01

# List all yearly reports
class YearlyReportListView(generics.ListAPIView):
    queryset = YearlyReport.objects.all().order_by('-year')
    serializer_class = YearlyReportSerializer

# Get a single yearly report by year
class YearlyReportDetailView(generics.RetrieveAPIView):
    queryset = YearlyReport.objects.all()
    serializer_class = YearlyReportSerializer
    lookup_field = 'year'

# List all doctors
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]


# List all appointments
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete'] 

    def perform_create(self, serializer):
        # Automatically set the patient to the logged-in user
        serializer.save(patient=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Admin can see/manage everything
            return Appointment.objects.all()
        # Patients can only see their own appointments
        return Appointment.objects.filter(patient=user)


    # Available small slots
    @action(detail=True, methods=["get"])
    def available_slots(self, request, pk=None):
        doctor = Doctor.objects.get(pk=pk)
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        available_dates = [
            start_of_week + timedelta(days=i)
            for i in range(7)
            if (start_of_week + timedelta(days=i)).strftime("%A") in doctor.available_days
        ]

        data = {}
        for d in available_dates:
            slots = get_available_time_slots(doctor, d)
            if slots:
                data[str(d)] = slots

        return Response(data)


# All reports 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def orders_report(request):
    filter_type = request.GET.get("filter", "daily")
    export_type = request.GET.get("export", None)

    today = datetime.today()
    start_date = end_date = today

    if filter_type == "daily":
        start_date = end_date = today
    elif filter_type == "weekly":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
    elif filter_type == "monthly":
        start_date = today.replace(day=1)
        next_month = today.replace(day=28) + timedelta(days=4)
        end_date = next_month - timedelta(days=next_month.day)
    elif filter_type == "yearly":
        start_date = today.replace(month=1, day=1)
        end_date = today.replace(month=12, day=31)
    elif filter_type == "custom":
        start_date_str = request.GET.get("start_date")
        end_date_str = request.GET.get("end_date")
        if not start_date_str or not end_date_str:
            return Response({"error": "start_date and end_date required for custom filter"}, status=400)
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")

    orders = Order.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)

    items = OrderItem.objects.filter(order__in=orders).values(
        "order__created_at__date", "product_name", "product_id"
    ).annotate(
        total_qty=Sum("quantity"),
        total_income=Sum("subtotal"),
        total_actual=Sum(F("actual_price") * F("quantity"))
    ).order_by("order__created_at__date", "product_name")

    report_data = []
    for item in items:
        try:
            product_obj = Product.objects.get(id=item["product_id"])
            stock = product_obj.stock
        except Product.DoesNotExist:
            stock = None

        report_data.append({
            "date": item["order__created_at__date"],
            "product": item["product_name"],
            "quantity_sold": item["total_qty"],
            "income": float(item["total_income"] or 0),
            "actual_cost": float(item["total_actual"] or 0),
            "profit": float((item["total_income"] or 0) - (item["total_actual"] or 0)),
            "stock_remaining": stock
        })

    if export_type in ["csv", "excel"] and report_data:
        response = HttpResponse(content_type="text/csv")
        response['Content-Disposition'] = f'attachment; filename="orders_report.{export_type}"'
        writer = csv.DictWriter(response, fieldnames=report_data[0].keys())
        writer.writeheader()
        for row in report_data:
            writer.writerow(row)
        return response

    return Response(report_data)
