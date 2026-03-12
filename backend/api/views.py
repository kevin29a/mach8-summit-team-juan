from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import ensure_csrf_cookie

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
        user = User.objects.create_user(username=username, email=username, password=password)
        login(request, user)
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
        return Response({'message': 'Login successful', 'username': user.username})
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
        return Response({'isAuthenticated': True, 'username': user.username})
    return Response({'isAuthenticated': False})
