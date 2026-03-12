from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'post', views.PostViewSet, basename='post')

urlpatterns = [
    path('csrf/', views.get_csrf, name='csrf'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('whoami/', views.whoami_view, name='whoami'),
    path('', include(router.urls)),
    path('likes/', views.like_list_view, name='like-list'),
    path('comments/', views.comment_list_view, name='comment-list'),
    path('posts/<int:post_id>/comments/', views.comment_view, name='comment-create'),
    path('posts/<int:pk>/', views.post_detail_view, name='post-detail'),
    path('comments/<int:pk>/', views.comment_view, name='comment-delete'),
    path('posts/<int:post_id>/', views.delete_post_view, name='delete_post'),
]
