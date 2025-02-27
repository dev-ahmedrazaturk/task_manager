from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_users = models.ManyToManyField(User, related_name='assigned_projects', blank=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    STATUS_CHOICES = [('ToDo', 'ToDo'), ('InProgress', 'InProgress'), ('Completed', 'Completed'), ('Archive', 'Archive')]

    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    project = models.ForeignKey("Project", on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ManyToManyField(User, related_name="tasks_assigned")  # Changed to ManyToManyField

    def __str__(self):
        return self.title
    

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.title}"
