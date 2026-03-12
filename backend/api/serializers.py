from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'title', 'content', 'excerpt', 
            'timestamp', 'public_access', 'authenticated_access', 
            'team_access', 'author_access', 'like_count'
        ]
        read_only_fields = ['id', 'author', 'excerpt', 'timestamp']

    def get_like_count(self, obj):
        return obj.like_count
