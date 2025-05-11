from .serializers import *
from rest_framework import status , permissions 
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
# Create your views here.



class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def post(self , request):
        serialisers = UserRegistrationSerializer(data=request.data)
        if serialisers.is_valid():
            serialisers.save()
            return Response(serialisers.data , status=status.HTTP_201_CREATED)
        
        return Response(serialisers.errors , status=status.HTTP_400_BAD_REQUEST)
    
class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer
    
    def post(self , request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id' : user.id,
                    'email' : user.email,
                    'username' : user.username
                }, 'message' : 'login successfull'}, status=status.HTTP_200_OK)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)