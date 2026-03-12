from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .models import User, Post, Team

class PostAPITests(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name='test_team')
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='testpassword123',
            team=self.team
        )
        self.url = '/api/post/'

    def test_create_post_authenticated(self):
        """
        Ensure we can create a new post object when authenticated.
        """
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Test Post',
            'content': 'This is a test post that is exactly long enough to be a valid post for our tests. It should be longer than just a few words. Let us add more text so that the excerpt works.'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Post.objects.get().title, 'Test Post')
        self.assertEqual(Post.objects.get().author, self.user)
        
    def test_create_post_unauthenticated(self):
        """
        Ensure unauthenticated users cannot create posts.
        """
        data = {
            'title': 'Test Post Unauth',
            'content': 'This should fail.'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
