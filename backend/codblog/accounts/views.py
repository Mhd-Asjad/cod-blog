import requests
from .serializers import *
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from dj_rest_auth.registration.views import SocialLoginView  # type: ignore
from rest_framework.decorators import api_view, permission_classes
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter

from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse

# Create your views here.


class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serialisers = UserRegistrationSerializer(data=request.data)
        if serialisers.is_valid():
            serialisers.save()
            return Response(serialisers.data, status=status.HTTP_201_CREATED)

        return Response(serialisers.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "profile_image": (
                            (user.profile_image.url) if user.profile_image else None
                        ),
                    },
                    "message": "login successfull",
                },
                status=status.HTTP_200_OK,
            )
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = GetUserDetailSerializer(instance=user)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"message": "Logged out successfully."}, status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GoogleLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get("access_token")  # actually id_token

        if not id_token:
            return Response(
                {"error": "ID token is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            google_response = requests.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
                timeout=5,
            )
        except requests.RequestException as e:
            return Response(
                {"error": "Failed to connect to Google", "details": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if google_response.status_code != 200:
            return Response(
                {"error": "Invalid ID token", "details": google_response.text},
                status=google_response.status_code,
            )

        google_user_data = google_response.json()

        email = google_user_data.get("email")
        name = google_user_data.get("name")

        if not email:
            return Response(
                {"error": "Email not found in Google token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, created = User.objects.get_or_create(
            email=email, defaults={"username": email.split("@")[0]}
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "profile_image": (
                        user.profile_image.url if user.profile_image else None
                    ),
                },
                "message": "Google login successful",
            },
            status=status.HTTP_200_OK,
        )
