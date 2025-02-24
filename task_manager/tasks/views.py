from tokenize import Comment
from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Task, Project, User, Comment
from .serializers import CommentSerializer, CustomTokenObtainPairSerializer, TaskSerializer, ProjectSerializer, RegisterSerializer, UserSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action


class UserViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        Get a list of all users.
        """
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]  # Ensure JWT Authentication is used
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated

    def get(self, request):
        """
        Get the details of the currently authenticated user.
        """
        # Serialize the user object using the UserSerializer
        serializer = UserSerializer(request.user)
        return Response(serializer.data)  # Return the serialized data in the response
    
class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required."}, status=400)

            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logout successful."}, status=200)

        except Exception:
            return Response({"error": "Invalid token."}, status=400)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        - Admin users can see all projects.
        - Regular users can only see projects they are assigned to or created by them.
        """
        user = self.request.user
        if user.is_admin:
            return Project.objects.all()
        return Project.objects.filter(assigned_users=user) | Project.objects.filter(created_by=user)

    def create(self, request, *args, **kwargs):
        """
        - Only admins can create projects.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can create projects."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        assigned_user_ids = data.get('assigned_users', [])
        project = Project.objects.create(
            name=data.get('name'),
            description=data.get('description'),
            created_by=request.user
        )
        project.assigned_users.set(assigned_user_ids)  # Assign users to project
        project.save()

        serializer = self.get_serializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """
        - Assign the authenticated user to `created_by` and handle assigned users.
        """
        serializer.save(created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        - Only admins can update projects.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can update projects."}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        data = request.data
        assigned_user_ids = data.get('assigned_users', [])
        instance.assigned_users.set(assigned_user_ids)
        instance.save()

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        - Only admins can update projects.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can update projects."}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        data = request.data
        assigned_user_ids = data.get('assigned_users', [])
        instance.assigned_users.set(assigned_user_ids)
        instance.save()

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        - Only admins can delete projects.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can delete projects."}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        instance.delete()
        return Response({"message": "Project deleted successfully."}, status=status.HTTP_200_OK)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        - Admin users can see all tasks.
        - Regular users can only see tasks assigned to them.
        """
        user = self.request.user
        if user.is_admin:
            return Task.objects.all()
        return Task.objects.filter(assigned_to=user)

    def perform_create(self, serializer):
        """
        - Ensure project ID is included.
        - Assign multiple users to the task.
        """
        project_id = self.request.data.get("project")  # Get project ID from request
        assigned_users = self.request.data.get("assigned_to", [])  # Get assigned users list

        if not project_id:
            return Response({"error": "Project ID is required to create a task."}, status=status.HTTP_400_BAD_REQUEST)

        # Save task with project
        task = serializer.save(project_id=project_id)  # Assign project ID explicitly

        # Assign ManyToMany Users
        if assigned_users:
            task.assigned_to.set(assigned_users)  # Use `.set()` to update ManyToMany field

    def update(self, request, *args, **kwargs):
        """
        - Ensure only admins or project managers can update tasks.
        - Manually handle updating the ManyToMany field (assigned users).
        """
        instance = self.get_object()

        # Check permissions
        if not request.user.is_admin and request.user not in instance.project.assigned_users.all():
            return Response({"error": "Only admins or project managers can update tasks."}, status=status.HTTP_403_FORBIDDEN)

        # Deserialize incoming data
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Save the task instance (excluding assigned users initially)
        updated_task = serializer.save()

        # Handle ManyToMany assigned users separately
        if "assigned_to" in request.data:
            assigned_users = request.data.get("assigned_to", [])  # Get assigned users from request
            updated_task.assigned_to.set(assigned_users)  # Update ManyToMany field

        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        - Ensure only an admin or project creator can delete a task.
        """
        instance = self.get_object()
        if not request.user.is_admin and request.user != instance.project.created_by:
            return Response({"error": "Only admins or the project creator can delete tasks."}, status=status.HTTP_403_FORBIDDEN)

        self.perform_destroy(instance)
        return Response({"message": "Task deleted successfully."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-project')
    def get_tasks_by_project(self, request):
        """
        Get tasks by project ID.
        - Admins: Can view all tasks in the project.
        - Regular users: Can only view tasks assigned to them in the project.
        """
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({"error": "Project ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user  # Get current user

        # Filter tasks based on user role
        if user.is_admin:
            tasks = Task.objects.filter(project_id=project_id)
        else:
            tasks = Task.objects.filter(project_id=project_id, assigned_to=user)

        tasks = tasks.select_related('project').prefetch_related('assigned_to')  # Optimize query

        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        - Admins can view all comments.
        - Regular users can only view comments on tasks assigned to them.
        - If a `task` query param is provided, filter comments for that task.
        """
        user = self.request.user
        queryset = Comment.objects.select_related('task', 'user')

        # Admin can see all comments, Regular users see only their tasks' comments
        if not user.is_admin:
            queryset = queryset.filter(user=user)

        # ✅ Correctly filter by task if `task` query param is provided
        task_id = self.request.query_params.get("task")
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset

    def perform_create(self, serializer):
        """
        - Assigns the logged-in user to the comment.
        - Ensures only task assignees or admins can comment.
        """
        task_id = self.request.data.get("task")

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Correctly check Many-to-Many relationship (task.assigned_to is ManyToManyField)
        if not (self.request.user.is_admin or task.assigned_to.filter(id=self.request.user.id).exists()):
            return Response({"error": "Only the task assignee or an admin can comment."}, status=status.HTTP_403_FORBIDDEN)

        serializer.save(user=self.request.user, task=task)

    def update(self, request, *args, **kwargs):
        """
        - Only the comment owner or admin can update a comment.
        """
        instance = self.get_object()
        if not (request.user == instance.user or request.user.is_admin):
            return Response({"error": "You can only edit your own comments."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        - Only the comment owner or admin can partially update a comment.
        """
        instance = self.get_object()
        if not (request.user == instance.user or request.user.is_admin):
            return Response({"error": "You can only update your own comments."}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        - Only the comment owner or admin can delete a comment.
        """
        instance = self.get_object()
        if not (request.user == instance.user or request.user.is_admin):
            return Response({"error": "You can only delete your own comments."}, status=status.HTTP_403_FORBIDDEN)

        instance.delete()
        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_200_OK)

