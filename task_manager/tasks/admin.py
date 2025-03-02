from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Project, Task, Comment

# Custom UserAdmin to display custom fields
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_admin', 'is_active')  # Fields to display
    list_filter = ('is_admin', 'is_active')  # Add filters
    search_fields = ('username', 'email')  # Enable search by these fields
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('email',)}),
        ('Permissions', {'fields': ('is_admin', 'is_active')}),
    )

# Register the User model with the custom admin class
admin.site.register(User, CustomUserAdmin)

# Register Project model
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')  # Fields to display
    list_filter = ('created_at',)  # Add filters
    search_fields = ('name', 'description')  # Enable search by these fields

admin.site.register(Project, ProjectAdmin)

# Register Task model
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'due_date', 'priority', 'status')  # Fields to display
    list_filter = ('priority', 'status', 'project')  # Add filters
    search_fields = ('title', 'description')  # Enable search by these fields

admin.site.register(Task, TaskAdmin)

# Register Comment model
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'created_at')  # Fields to display
    list_filter = ('created_at', 'user')  # Add filters
    search_fields = ('text',)  # Enable search by these fields

admin.site.register(Comment, CommentAdmin)
