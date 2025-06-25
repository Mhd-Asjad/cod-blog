from django.contrib import admin
from .views import *
from .models import *

# Register your models here.

admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Follow)
admin.site.register(Notifications)
