from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import CustomTokenObtainPairSerializer, UserRegistrationSerializer
from .models import CustomUser, EmailOTP
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.save()
        otp_obj.delete()  # Delete OTP after successful verification

        return Response({'message': 'User verified successfully'}, status=status.HTTP_200_OK)


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
        return Response({"email": user.email, "id": user.id})

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

# Test email sending functionality
# from django.core.mail import send_mail
# from django.http import JsonResponse

# def test_email(request):
#     send_mail(
#         subject='Test Email from ShasthoMeds',
#         message='This is a test email sent from your Django project!',
#         from_email=None,  # uses EMAIL_HOST_USER from settings
#         recipient_list=['farhanasha0113@gmail.com'],
#         fail_silently=False,
#     )
#     return JsonResponse({'message': 'Email sent successfully!'})
