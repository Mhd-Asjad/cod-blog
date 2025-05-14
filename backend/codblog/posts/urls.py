from django.urls import path
from .views import *


urlpatterns = [
    path("create-posts/", CreatePostView.as_view(), name="create-posts"),
    path("upload-image/", upload_image, name="upload-image"),
    path("fetch-url/", fetch_url, name="fetch-url"),
    path("list-posts/", ListPostView.as_view(), name="list-posts"),
    path("show-post/<int:pk>/", ShowPostDetailView.as_view(), name="show-post"),
    path("public-profile/<int:user_id>/", ShowUserProfileView.as_view(), name="public-profile"),
    path("author-profile/", AuthorProfileView.as_view(), name='author-profile'),
    path("delete-post/<int:pk>/", delete_post, name="delete-post")
    path("edit-post/<int:pk>/" , EditPost.as_view(), name='edit-post')
]
