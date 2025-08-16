# Rest API endpoint

from django.urls import path
from .views import (
    APIRootView, BrandViewSet, CategoryViewSet, LogoutView, ProductViewSet, RegisterAPIView, ResendOTPView,
    UpdateProfileView, VerifyOTPView, CustomTokenObtainPairView,
)

from rest_framework_simplejwt.views import ( # pyright: ignore[reportMissingImports]
    TokenRefreshView,
)

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('api/register/', RegisterAPIView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    
] 
