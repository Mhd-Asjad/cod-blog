from rest_framework import serializers
from .models import Follow, Post
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "profile_image", "email"]


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "content",
            "author",
            "created_at",
            "updated_at",
            "like",
            "is_liked",
        ]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        user = request.user if request else None

        if user and user.is_authenticated:
            return obj.liked_by.filter(id=user.id).exists()
        return False


class PostEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["title", "content"]


class HomePostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "title",
            "like",
            "created_at",
        ]


class SimplePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "created_at", "like"]

class UserProfileSerializer(serializers.ModelSerializer):
    posts = SimplePostSerializer(source="post_set", many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile_image", "posts", "bio"]


class PostSearchSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    author_first_name = serializers.CharField(
        source="author.first_name", read_only=True
    )

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "like",
            "created_at",
            "author_username",
            "author_first_name",
        ]


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ["following"]

    def create(self, validated_data):
        follower = self.context["request"].user
        following = validated_data["following"]

        if follower == following:
            raise serializers.ValidationError("You cannot follow yourself.")

        follow, created = Follow.objects.get_or_create(
            follower=follower, following=following
        )

        if not created:
            raise serializers.ValidationError("Already following this user.")
        return follow
            
    