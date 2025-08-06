from django.urls import path
from .views import APIRootView, LogoutView, RegisterAPIView, ResendOTPView, UpdateProfileView, VerifyOTPView, CustomTokenObtainPairView

from rest_framework_simplejwt.views import ( # pyright: ignore[reportMissingImports]
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('api/register/', RegisterAPIView.as_view(), name='register'),
    # path('test-email/', test_email),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    
    # Login
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Update Profile
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),

    # Logout
    path('api/logout/', LogoutView.as_view(), name='logout')
]
