from django.urls import path
from .views import (
    APIRootView, LogoutView, RegisterAPIView, ResendOTPView,
    UpdateProfileView, VerifyOTPView, CustomTokenObtainPairView,

    # CRUD views
    CategoryViewSet, BrandViewSet, ProductViewSet,
    PrescriptionRequestViewSet, add_to_cart, get_or_create_cart,
)

from rest_framework_simplejwt.views import ( # pyright: ignore[reportMissingImports]
    TokenObtainPairView,
    TokenRefreshView,
)

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'category', CategoryViewSet, basename='category')
router.register(r'brand', BrandViewSet, basename='brand')
router.register(r'product', ProductViewSet, basename='product')
router.register(r'prescription-request', PrescriptionRequestViewSet, basename='prescriptionrequest')


urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('api/register/', RegisterAPIView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('cart/', get_or_create_cart, name='cart-get-or-create'),
    path('cart/add/', add_to_cart, name='cart-add'),
] + router.urls
