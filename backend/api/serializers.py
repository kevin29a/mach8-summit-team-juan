from rest_framework import serializers
from .models import Like, User, Post, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_name', 'team_name', 'title', 'content', 'excerpt', 
            'timestamp', 'public_access', 'authenticated_access', 
            'team_access', 'author_access', 'like_count'
        ]
        read_only_fields = ['id', 'author', 'author_name', 'team_name', 'excerpt', 'timestamp']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username

    def get_team_name(self, obj):
        return obj.author.team.name if obj.author.team else None

    def get_like_count(self, obj):
        return obj.like_count

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'timestamp']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'content', 'timestamp']
        read_only_fields = ['id', 'user', 'post', 'timestamp']

class CommentListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'username', 'content', 'timestamp', 'post']
