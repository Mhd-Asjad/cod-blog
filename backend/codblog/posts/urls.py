from django.urls import path
from .views import *
urlpatterns = [
    path('create/',Create_Post.as_view() , name='create-post')
]