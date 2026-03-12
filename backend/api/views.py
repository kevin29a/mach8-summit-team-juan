from django.contrib.auth import authenticate, login, logout, get_user_model
User = get_user_model()
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework.pagination import PageNumberPagination
from .models import Like, Post, Comment
from .serializers import LikeSerializer, CommentSerializer, CommentListSerializer
from django.db.models import Q

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf(request):
    return Response({'message': 'CSRF cookie set'})

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')  # Frontend might send email as username
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        from .models import Team
        default_team, _ = Team.objects.get_or_create(name='default_team')
        
        user = User.objects.create_user(username=username, email=username, password=password)
        user.team = default_team
        user.save()
        return Response({'message': 'Registration successful', 'username': user.username}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({'message': 'Login successful', 'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name})
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})

@api_view(['GET'])
@permission_classes([AllowAny])
def whoami_view(request):
    user = request.user
    if user.is_authenticated:
        return Response({'isAuthenticated': True, 'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name})
    return Response({'isAuthenticated': False})

from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows posts to be viewed or edited.
    Automatically assigns the author on create.
    """
    queryset = Post.objects.all().order_by('-timestamp')
    serializer_class = PostSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Determine viewable posts
        view_levels = ['READ_ONLY', 'READ_WRITE']
        condition = Q(public_access__in=view_levels)
        
        if user.is_authenticated:
            condition |= Q(authenticated_access__in=view_levels)
            if user.team:
                condition |= Q(author__team=user.team, team_access__in=view_levels)
            condition |= Q(author=user, author_access__in=view_levels)
            
        return Post.objects.filter(condition).distinct().order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

def get_effective_access(user, post):
    """
    Returns the maximum access level a user has to a post.
    Access levels: 0 (NONE), 1 (READ_ONLY), 2 (READ_WRITE).
    Enforces the hierarchy: Public < Authenticated < Team < Author.
    """
    level_map = {
        'NONE': 0,
        'READ_ONLY': 1,
        'READ_WRITE': 2
    }
    
    # 1. Public tier
    eff_access = level_map.get(post.public_access, 0)
    
    if user.is_authenticated:
        # 2. Authenticated tier
        eff_access = max(eff_access, level_map.get(post.authenticated_access, 0))
        
        # 3. Team tier
        if user.team and post.author.team == user.team:
            eff_access = max(eff_access, level_map.get(post.team_access, 0))
            
        # 4. Author tier
        if post.author == user:
            eff_access = max(eff_access, level_map.get(post.author_access, 0))
            
    return eff_access

def has_view_access(user, post):
    """
    Check if a user has view access to a post based on the effective access hierarchy.
    """
    return get_effective_access(user, post) >= 1

def has_edit_access(user, post):
    """
    Check if a user has edit access to a post based on the effective access hierarchy.
    """
    return get_effective_access(user, post) >= 2

@api_view(['DELETE'])
@permission_classes([AllowAny])
def post_detail_view(request, pk):
    """
    Retrieve, update or delete a post instance.
    Currently only supports DELETE according to User Story 8.
    """
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if not has_edit_access(request.user, post):
            return Response(
                {'error': 'You do not have permission to delete this post'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response({'message': 'Post deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def comment_view(request, post_id=None, pk=None):
    user = request.user
    
    if request.method == 'POST':
        if not post_id:
            return Response({'error': 'Post ID is required for creating a comment'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if not has_view_access(user, post):
            return Response({'error': 'No view access to post'}, status=status.HTTP_403_FORBIDDEN)
            
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        comment = Comment.objects.create(user=user, post=post, content=content)
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    elif request.method == 'DELETE':
        if not pk:
            return Response({'error': 'Comment ID is required for deletion'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if comment.user != user:
            return Response({'error': 'You can only delete your own comments'}, status=status.HTTP_403_FORBIDDEN)
            
        if not has_view_access(user, comment.post):
            return Response({'error': 'No view access to post'}, status=status.HTTP_403_FORBIDDEN)
            
        comment.delete()
        return Response({'message': 'Comment deleted'}, status=status.HTTP_204_NO_CONTENT)

class LikePagination(PageNumberPagination):
    page_size = 20
    
    def get_paginated_response(self, data):
        return Response({
            'current_page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'total_count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def like_list_view(request):
    user = request.user
    
    # Access Levels: NONE, READ_ONLY, READ_WRITE
    view_levels = ['READ_ONLY', 'READ_WRITE']
    
    # Base condition: public access
    condition = Q(public_access__in=view_levels)
    
    if user.is_authenticated:
        # Authenticated access
        condition |= Q(authenticated_access__in=view_levels)
        
        # Team access
        if user.team:
            condition |= Q(author__team=user.team, team_access__in=view_levels)
            
        # Author access
        condition |= Q(author=user, author_access__in=view_levels)
        
    viewable_posts = Post.objects.filter(condition)
    queryset = Like.objects.filter(post__in=viewable_posts).order_by('-timestamp')
    
    # Filtering
    post_id = request.query_params.get('post')
    if post_id:
        queryset = queryset.filter(post_id=post_id)
        
    user_id = request.query_params.get('user')
    if user_id:
        queryset = queryset.filter(user_id=user_id)
        
    # Pagination
    paginator = LikePagination()
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = LikeSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = LikeSerializer(queryset, many=True)
    return Response(serializer.data)

class CommentPagination(PageNumberPagination):
    page_size = 10
    
    def get_paginated_response(self, data):
        return Response({
            'current_page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'total_count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def comment_list_view(request):
    user = request.user
    
    # Access Levels: NONE, READ_ONLY, READ_WRITE
    view_levels = ['READ_ONLY', 'READ_WRITE']
    
    # Base condition: public access
    condition = Q(public_access__in=view_levels)
    
    if user.is_authenticated:
        # Authenticated access
        condition |= Q(authenticated_access__in=view_levels)
        
        # Team access
        if user.team:
            condition |= Q(author__team=user.team, team_access__in=view_levels)
            
        # Author access
        condition |= Q(author=user, author_access__in=view_levels)
        
    viewable_posts = Post.objects.filter(condition)
    queryset = Comment.objects.filter(post__in=viewable_posts).order_by('timestamp')
    
    # Filtering
    post_id = request.query_params.get('post')
    if post_id:
        queryset = queryset.filter(post_id=post_id)
        
    user_id = request.query_params.get('user')
    if user_id:
        queryset = queryset.filter(user_id=user_id)
        
    # Pagination
    paginator = CommentPagination()
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = CommentListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = CommentListSerializer(queryset, many=True)
    return Response(serializer.data)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post_view(request, post_id):
    from .models import Post
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if not has_edit_access(request.user, post):
        return Response({'error': 'You do not have permission to delete this post'}, status=status.HTTP_403_FORBIDDEN)
        
    post.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
