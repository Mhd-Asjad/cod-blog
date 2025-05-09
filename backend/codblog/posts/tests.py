from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
# Create your tests here.

class TestCreatePost(TestCase):
    def setUp(self):
        
        self.client = APIClient()
        self.create_posturl = reverse('create')
    
    
    def testpost(self) :
        posts = {
            'title' : ''
        }