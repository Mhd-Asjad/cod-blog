from django.urls import path
from .views import *


urlpatterns = [
    path("create-posts/", CreatePostView.as_view(), name="create-posts"),
    path("upload-image/", upload_image, name="upload-image"),
    path("fetch-url/", fetch_url, name="fetch-url"),
    path("list-posts/", ListPostView.as_view(), name="list-posts"),
    path("save-post/", SavedPostsListView.as_view(), name="get-saved-posts"),
    path(
        "save-post/<int:post_id>/",
        ToggleSavePostView.as_view(),
        name="toggle-save-post",
    ),
    path("show-post/<int:pk>/", ShowPostDetailView.as_view(), name="show-post"),
    path(
        "public-profile/<int:user_id>/",
        ShowUserProfileView.as_view(),
        name="public-profile",
    ),
    path("author-profile/", AuthorProfileView.as_view(), name="author-profile"),
    path("delete-post/<int:pk>/", delete_post, name="delete-post"),
    path("edit-post/<int:pk>/", EditPost.as_view(), name="edit-post"),
    path("search/", PostSearchAPIView.as_view(), name="search"),
    path("post-like/<int:post_id>/", PostLikeView.as_view(), name="post-like"),
    path("follow/", FollowUserView.as_view(), name="follow-user"),
    path("unfollow/", UnfollowUserView.as_view(), name="unfollow-user"),
    path(
        "follow/status/<int:user_id>/", FollowStatusView.as_view(), name="follow-status"
    ),
    path(
        "get-follow-count/<int:user_id>/",
        GetFollowCountView.as_view(),
        name="follow-count",
    ),
    path("following-posts/", FollowedPostView.as_view(), name="following-posts"),
    path(
        "list-notifications/<int:user_id>/",
        list_notifications.as_view(),
        name="list-notifications",
    ),
    path(
        "notification-actions/<int:notification_id>/",
        notification_actions.as_view(),
        name="notification-actions",
    ),
    path("list-comment/<int:post_id>/", ListCommentView.as_view(), name="list-comment"),
    path("create-comment/", CreateCommentView.as_view(), name="create-comment"),
    path(
        "update-comment/<int:comment_id>/",
        UpdateCommentView.as_view(),
        name="update-comment",
    ),
    path(
        "delete-comment/<int:comment_id>/",
        DeleteCommentView.as_view(),
        name="delete-comment",
    ),
]
