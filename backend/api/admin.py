from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Team, Post, Like, Comment

class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'team')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Info', {'fields': ('role', 'team', 'email')}),
    )
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'team', 'is_staff']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    list_filter = ['role', 'team', 'is_staff', 'is_active']

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'timestamp', 'public_access', 'authenticated_access', 'team_access', 'author_access')
    list_filter = ('public_access', 'authenticated_access', 'team_access', 'author_access', 'timestamp')
    search_fields = ('title', 'content', 'author__email', 'author__username')
    readonly_fields = ('excerpt', 'timestamp')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('user__email', 'user__username', 'post__title')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'timestamp', 'content_snippet')
    list_filter = ('timestamp',)
    search_fields = ('user__email', 'user__username', 'post__title', 'content')
    
    def content_snippet(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_snippet.short_description = 'Content'

admin.site.register(User, CustomUserAdmin)
