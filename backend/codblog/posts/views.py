import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics
from .serializers import PostSerializer
from django.contrib.auth import get_user_model
from .models import Post
import logging

User = get_user_model()
MAX_IMAGE_SIZE = 5  # MB
logger = logging.getLogger(__name__)


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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
    serializer_class = PostSerializer
    queryset = Post.objects.all().order_by("-created_at")


class ShowPostDetailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
            serializer = PostSerializer(post)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response(
                {"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )
