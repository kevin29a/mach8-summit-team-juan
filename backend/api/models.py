from django.db import models
from django.contrib.auth.models import AbstractUser

class Team(models.Model):
    """
    Teams are used for permissions management. Each user belongs to exactly one team[cite: 15, 18].
    """
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    """
    Custom User model supporting 'admin' and 'blogger' roles[cite: 17].
    The username is treated as an email address per the frontend requirements[cite: 157].
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('blogger', 'Blogger'),
    ]
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='blogger')
    # Each user is a member of exactly 1 team[cite: 18]. 
    # A default team is assigned to new users during registration[cite: 160].
    team = models.ForeignKey(Team, on_delete=models.PROTECT, null=True, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    @property
    def is_blogger(self):
        return self.role == 'blogger'

    def __str__(self):
        return self.email

class Post(models.Model):
    """
    Blogging platform posts with independent access controls for 4 different levels[cite: 19, 23, 24].
    """
    class AccessLevel(models.TextChoices):
        NONE = 'NONE', 'None'
        READ_ONLY = 'READ_ONLY', 'Read Only'
        READ_WRITE = 'READ_WRITE', 'Read and Write'

    # Core Attributes [cite: 50-56]
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    excerpt = models.CharField(max_length=200, editable=False) # First 200 characters 
    timestamp = models.DateTimeField(auto_now_add=True)

    # Independent permissions for all 4 levels 
    # Default values are set according to User Story 5 ACs [cite: 520-522].
    public_access = models.CharField(
        max_length=20, choices=AccessLevel.choices, default=AccessLevel.READ_ONLY
    )
    authenticated_access = models.CharField(
        max_length=20, choices=AccessLevel.choices, default=AccessLevel.READ_ONLY
    )
    team_access = models.CharField(
        max_length=20, choices=AccessLevel.choices, default=AccessLevel.READ_WRITE
    )
    author_access = models.CharField(
        max_length=20, choices=AccessLevel.choices, default=AccessLevel.READ_WRITE
    )

    class Meta:
        ordering = ['-timestamp'] # Reverse chronological order 
        indexes = [
            models.Index(fields=['timestamp', 'author']),
        ]

    def save(self, *args, **kwargs):
        # Automatically set the excerpt as the first 200 characters 
        if self.content:
            self.excerpt = self.content[:200]
        super().save(*args, **kwargs)

    @property
    def like_count(self):
        return self.likes.count() # Requirement to show current number of likes [cite: 241]

    def __str__(self):
        return self.title

class Like(models.Model):
    """
    Tracks user engagement. Prevents multiple likes from the same user on one post[cite: 80, 83].
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent multiple likes from the same user on a single post [cite: 83]
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_like_per_post_user')
        ]

    def __str__(self):
        return f"{self.user.email} likes {self.post.title}"

class Comment(models.Model):
    """
    Facilitates discussions. Ordered by creation date[cite: 99, 451].
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Oldest comments first in detail view 
        ordering = ['timestamp']

    def __str__(self):
        return f"Comment by {self.user.email} on {self.post.title}"