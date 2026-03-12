from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', views.get_csrf, name='csrf'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('whoami/', views.whoami_view, name='whoami'),
]
