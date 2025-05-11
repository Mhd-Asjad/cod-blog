from django.urls import path
from .views import *


urlpatterns = [
    path('create-posts/', CreatePostView.as_view(), name='create-posts'),
    path('upload-image/', upload_image, name='upload-image'),
    path('fetch-url/', fetch_url, name='fetch-url'),
]