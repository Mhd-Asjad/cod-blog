from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
# Create your models here.

class CustomuserManager(UserManager):
    def _create_user(self, email, password, *args, **extra_fields):
        if not email:
            raise ValueError("Email field is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_user(self, email = None, password = None, **extra_fields):
        extra_fields.setdefault("is_active", True)
        return self._create_user(email, password, **extra_fields)
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self._create_user(email, password, **extra_fields)

    
class CustomUser(AbstractUser) :
    email = models.EmailField(max_length=200 , unique=True)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        null=True, blank=True
    )
    bio = models.TextField(null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = CustomuserManager()
    
    def __str__(self):
        return self.email
