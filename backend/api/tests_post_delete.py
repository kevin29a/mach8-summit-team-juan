from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import User, Team, Post, Like, Comment

class PostDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.team = Team.objects.create(name='Team A')
        self.other_team = Team.objects.create(name='Team B')
        
        self.author = User.objects.create_user(
            username='author@test.com', 
            email='author@test.com', 
            password='password',
            team=self.team
        )
        self.team_member = User.objects.create_user(
            username='member@test.com', 
            email='member@test.com', 
            password='password',
            team=self.team
        )
        self.other_user = User.objects.create_user(
            username='other@test.com', 
            email='other@test.com', 
            password='password',
            team=self.other_team
        )
        
        self.post = Post.objects.create(
            author=self.author,
            title='Test Post',
            content='Test Content'
        )
        
        self.comment = Comment.objects.create(
            user=self.other_user,
            post=self.post,
            content='Nice post!'
        )
        self.like = Like.objects.create(
            user=self.other_user,
            post=self.post
        )

    def test_author_can_delete_post(self):
        self.client.force_authenticate(user=self.author)
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(pk=self.post.pk).exists())
        self.assertFalse(Comment.objects.filter(pk=self.comment.pk).exists())
        self.assertFalse(Like.objects.filter(pk=self.like.pk).exists())

    def test_team_member_can_delete_post(self):
        self.client.force_authenticate(user=self.team_member)
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(pk=self.post.pk).exists())

    def test_other_user_cannot_delete_post(self):
        self.client.force_authenticate(user=self.other_user)
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Post.objects.filter(pk=self.post.pk).exists())

    def test_unauthenticated_user_cannot_delete_post(self):
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Post.objects.filter(pk=self.post.pk).exists())

    def test_public_delete_permission(self):
        self.post.public_access = Post.AccessLevel.READ_WRITE
        self.post.save()
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(pk=self.post.pk).exists())

    def test_authenticated_delete_permission(self):
        self.post.authenticated_access = Post.AccessLevel.READ_WRITE
        # Default team_access and author_access are READ_WRITE, but other_user is not in team
        # and not author. Let's make sure team_access is NONE to isolate authenticated_access
        self.post.team_access = Post.AccessLevel.NONE
        self.post.save()
        
        self.client.force_authenticate(user=self.other_user)
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(pk=self.post.pk).exists())
