from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import User, Team, Post, Like, Comment

class LikesCommentsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.team = Team.objects.create(name='Team A')
        
        self.author = User.objects.create_user(
            username='author@test.com', 
            email='author@test.com', 
            password='password',
            team=self.team
        )
        self.other_user = User.objects.create_user(
            username='other@test.com', 
            email='other@test.com', 
            password='password'
        )
        
        # Post with READ_ONLY for authenticated users
        self.post = Post.objects.create(
            author=self.author,
            title='Test Post',
            content='Test Content',
            public_access='NONE',
            authenticated_access='READ_ONLY',
            team_access='READ_WRITE',
            author_access='READ_WRITE'
        )
        
        for i in range(25):
            u = User.objects.create_user(username=f'user{i}@test.com', email=f'user{i}@test.com', password='password')
            Like.objects.create(user=u, post=self.post)
            Comment.objects.create(user=self.author, post=self.post, content=f'Comment {i}')

    def test_view_likes_pagination(self):
        url = reverse('like-list')
        # Anonymous user cannot view (public_access=NONE)
        response = self.client.get(url)
        self.assertEqual(len(response.data.get('results', [])), 0)

        # Authenticated user can view
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 20)
        self.assertEqual(response.data['total_count'], 25)
        self.assertEqual(response.data['total_pages'], 2)
        self.assertIn('current_page', response.data)

    def test_view_comments_pagination(self):
        url = reverse('comment-list')
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)
        self.assertEqual(response.data['total_count'], 25)
        self.assertEqual(response.data['total_pages'], 3)

    def test_create_comment(self):
        url = reverse('comment-create', kwargs={'post_id': self.post.id})
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(url, {'content': 'New comment'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.filter(post=self.post).count(), 26)

    def test_delete_own_comment(self):
        comment = Comment.objects.create(user=self.other_user, post=self.post, content='My comment')
        url = reverse('comment-delete', kwargs={'pk': comment.id})
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(pk=comment.pk).exists())

    def test_cannot_delete_others_comment(self):
        comment = Comment.objects.create(user=self.author, post=self.post, content='Author comment')
        url = reverse('comment-delete', kwargs={'pk': comment.id})
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Comment.objects.filter(pk=comment.pk).exists())
