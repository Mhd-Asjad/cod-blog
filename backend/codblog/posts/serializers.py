from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import *
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('id' , 'title' , 'content', 'image')