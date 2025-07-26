from django.urls import path
from .views import RegisterAPIView, VerifyOTPView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    # path('test-email/', test_email),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp')
]
