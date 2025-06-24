from django.urls import path
from .views import *

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="user-register"),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("logout/", logout_view, name="user-logout"),
    path("get-user/", GetUserDetailView.as_view(), name="get-user"),
    path("google/", GoogleLogin.as_view(), name="google-login"),
]
