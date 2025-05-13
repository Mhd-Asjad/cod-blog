from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="author.id", read_only=True)
    username = serializers.CharField(source="author.username", read_only=True)
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = ["author"]

    def get_user_profile(self, obj):
        return obj.author.profile_image.url if obj.author.profile_image else None


class HomePostSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="author.id", read_only=True)
    username = serializers.CharField(source="author.username", read_only=True)
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user_id",
            "username",
            "user_profile",
            "title",
            "like",
            "dislike",
            "created_at",
        ]

    def get_user_profile(self, obj):
        return obj.author.profile_image.url if obj.author.profile_image else None
