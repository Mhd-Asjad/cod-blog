from rest_framework import serializers
from .models import Post
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "profile_image", "email"]


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Post
        fields = "__all__"


class HomePostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "title",
            "like",
            "dislike",
            "created_at",
        ]


class SimplePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    posts = SimplePostSerializer(source="post_set", many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile_image", "posts", 'bio']


