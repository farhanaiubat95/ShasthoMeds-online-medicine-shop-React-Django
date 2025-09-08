# Rest API endpoint

from django.urls import include, path

from .SSLCOMMERZ import payment_success, payment_fail, payment_cancel


from .views import (
    APIRootView, AppointmentViewSet, BrandViewSet, CartViewSet, CategoryViewSet, DoctorViewSet,LogoutView, MonthlyReportDetailView, MonthlyReportListView, OrderViewSet, PrescriptionRequestViewSet, ProductViewSet, RegisterAPIView, ResendOTPView,
    UpdateProfileView, UserListView, VerifyOTPView, CustomTokenObtainPairView, YearlyReportDetailView, YearlyReportListView,
)

from rest_framework_simplejwt.views import ( # pyright: ignore[reportMissingImports]
    TokenRefreshView,
)

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'prescriptions', PrescriptionRequestViewSet, basename='prescription')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'appointments', AppointmentViewSet, basename='appointment')



urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('api/register/', RegisterAPIView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("users/", UserListView.as_view(), name="user-list"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

    path("payment/success/", payment_success, name="payment_success"),
    path("payment/fail/", payment_fail, name="payment_fail"),
    path("payment/cancel/", payment_cancel, name="payment_cancel"),

    path('monthly/', MonthlyReportListView.as_view(), name='monthly-report-list'),
    path('monthly/<str:month>/', MonthlyReportDetailView.as_view(), name='monthly-report-detail'),
    path('yearly/', YearlyReportListView.as_view(), name='yearly-report-list'),
    path('yearly/<int:year>/', YearlyReportDetailView.as_view(), name='yearly-report-detail'),


    # Include router URLs
    path('', include(router.urls)),  # Corrected path and added namespace
] 
