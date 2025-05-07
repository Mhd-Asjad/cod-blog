from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView ,
    TokenRefreshView
)
urlpatterns = [
    
    path('token/' , TokenObtainPairView.as_view() , name='token_obtain_pair'),
    path('token/refresh/' , TokenRefreshView.as_view() , name='token_refresh'),
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
]