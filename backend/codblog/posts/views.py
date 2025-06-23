from django.shortcuts import get_object_or_404
import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count
from rest_framework.views import APIView
from rest_framework import status, generics

from .serializers import *
from django.contrib.auth import get_user_model
from rest_framework.pagination import PageNumberPagination
from .models import Post
import logging

User = get_user_model()
MAX_IMAGE_SIZE = 5  # MB
logger = logging.getLogger(__name__)


class CustomPaginationClass(PageNumberPagination):
    page_size = 15


class CreatePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("this is the request data : ", request.data)
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@parser_classes([MultiPartParser])
# @permission_classes([IsAuthenticated])
def upload_image(request):
    print(f"this is the request data : {request.data}")
    image = request.FILES.get("image")
    print(f"this is the image {image}")

    if not image:
        return Response({"success": 0, "message": "No image found."})

    if image.size > MAX_IMAGE_SIZE * 1024 * 1024:
        return Response({"success": 0, "message": "Image size must be under 5MB."})

    path = default_storage.save(f"post_images/{image.name}", image)
    image_url = request.build_absolute_uri(f"/media/{path}")
    return Response({"success": 1, "file": {"url": image_url}})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def fetch_url(request):
    image_url = request.data.get("url")
    if not image_url:
        return Response({"success": 0, "message": "No URL provided."})

    try:
        response = requests.get(image_url)
        if response.status_code != 200:
            return Response({"success": 0, "message": "Failed to download image."})
        elif len(response.content) > MAX_IMAGE_SIZE * 1024 * 1024:
            return Response({"success": 0, "message": "Image is larger than 5MB."})

        filename = image_url.split("/")[-1]
        path = default_storage.save(
            f"post_images/{filename}", ContentFile(response.content)
        )
        response_url = request.build_absolute_uri(f"/media/{path}")
        return Response({"success": 1, "file": {"url": response_url}})
    except Exception as e:
        return Response({"success": 0, "message": f"Error fetching image: {str(e)}"})


class ListPostView(generics.ListAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = HomePostSerializer
    pagination_class = CustomPaginationClass

    def get_queryset(self):
        sort_by = self.request.query_params.get('sort', 'newest')

        queryset = Post.objects.all()

        if sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort_by == 'most_liked':
            queryset = queryset.annotate(like_count=Count('like')).order_by('-like_count', '-created_at')
            print('most liked' ,queryset)
        elif sort_by == 'least_liked':
            queryset = queryset.annotate(like_count=Count('like')).order_by('like_count', 'created_at')
            print('least liked' ,queryset)
        else:
            queryset = queryset.order_by('-created_at')

        return queryset


class ShowPostDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
            serializer = PostSerializer(post, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response(
                {"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ShowUserProfileView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserProfileSerializer
    lookup_url_kwarg = "user_id"

    def get_queryset(self):
        user_id = self.kwargs.get(self.lookup_url_kwarg)
        return User.objects.filter(id=user_id)


class AuthorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:

            user = request.user
            serializer = UserProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_post(request, pk):
    try:
        post = Post.objects.get(pk=pk, author=request.user)
        post.delete()
        return Response({"message": "Post deleted successfully"})
    except Post.DoesNotExist:
        return Response({"error": "Post not found or unauthorized"}, status=404)


class EditPost(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        data = request.data
        content = data.get('content', None)
        print(content)
        
        title = None
        for block in content.get("blocks", []):
            if block.get("type") == "header":
                title = block.get("data", {}).get("text", "").strip()
                if title:
                    break
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response(
                {"error": "post not found"}, status=status.HTTP_404_NOT_FOUND
            )
        data['title'] = title
        print("this is the title", title)
        serializer = PostEditSerializer(instance=post, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostSearchAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.GET.get("q", "")
        if query:
            posts = Post.objects.filter(
                Q(title__icontains=query) | Q(author__username__icontains=query)
            )
        else:
            posts = Post.objects.none()

        serializer = PostSearchSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostLikeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        try:
            post = Post.objects.get(id = post_id)
        except Post.DoesNotExist:
            return Response({"error" : "Post does not exists"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user in post.liked_by.all():
            post.liked_by.remove(user)
            post.like = max(0, post.like - 1)
            post.save()
            is_liked = False
            message = "Like removed"
            return Response({"message": message, "likes": post.like, "is_liked" : is_liked})

        else:
            post.liked_by.add(user)
            post.like += 1
            post.save()
            is_liked = True
            message = "Like added"
            return Response({"message": message, "likes": post.like, "is_liked" : is_liked})

# ----------------------------------------

class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = FollowSerializer(data = request.data, context = {'request' : request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({'detail' : "Followed Successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        following_id = request.data.get('following')
        
        try:
            following_user = User.objects.get(id = following_id)
            follow = Follow.objects.get(follower = request.user, following = following_user)

            follow.delete()
            return Response({'detail' : "Unfollowed Successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Follow.DoesNotExist:
            return Response({"detail": "You are not following this user."}, status=status.HTTP_400_BAD_REQUEST)
        
class FollowStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        target_user = get_object_or_404(User, id = user_id)
        is_following = Follow.objects.filter(follower = request.user, following = target_user).exists()
        
        return Response({"is_following" : is_following})
    
class GetFollowCountView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        user = request.user
            
        follower_count = Follow.objects.filter(following=user).count()
        following_count = Follow.objects.filter(follower=user).count()
        
        return Response({
            "follower_count": follower_count,
            "following_count": following_count
        })
        
        
class FollowedPostView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        followed_users = Follow.objects.filter(follower = user).values_list('following', flat=True)
        posts = Post.objects.filter(author__id__in=followed_users).order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializers.data)
