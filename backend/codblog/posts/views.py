from django.shortcuts import render
from rest_framework import status , permissions 
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import CustomUser
from .models import Post , PostImage , Tag
from django.contrib.auth import get_user_model

# Create your views here.

User = get_user_model()

class Create_Post(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self , request , user_id) :
        try :   
            data = request.data
            title = data.get('title')
            content = data.get('content')
            tags = data.get('tags' , [])
            images = data.get('images',[])
            
            try :
                user = User.objects.get(id=user_id)
                
            except User.DoesNotExist:
                return Response({'error' : 'user not found'},status=status.HTTP_400_BAD_REQUEST)
            
            if Post.objects.filter(title=title).exists():
                return Response({'error':'post already exists'} , status=status.HTTP_400_BAD_REQUEST)
            
            if not isinstance(tags , list):
                return Response({'error' : 'tags should be in array format'} , status=status.HTTP_400_BAD_REQUEST)
            tag_ids = []
            for tag in tags : 
                if not tag or not isinstance(tag , str):
                    continue
                
                tag , created = Tag.objects.create(name = tag)
                tag_ids.append(tag.id)
            
            post = Post.objects.create(
                author = user,
                title = title,
                content = content
            )
            if tag_ids :
                post.tags.set(tag_ids)
            
            if isinstance(images , list) :
                for image in images :
                    PostImage.objects.create(
                        post=post,
                        image = image
                    )
            return Response({'message':'Post created successfully'},status=status.HTTP_200_OK)
        
        except Exception as e :
            return Response({'error':str(e)} , status=status.HTTP_500_INTERNAL_SERVER_ERROR)

