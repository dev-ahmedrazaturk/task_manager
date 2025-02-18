from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Task, Project, User
from .serializers import TaskSerializer, ProjectSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

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
        else:
            return Project.objects.filter(assigned_users=user) | Project.objects.filter(created_by=user)

    def create(self, request, *args, **kwargs):
        """
        - Only admins can create projects.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can create projects."}, status=status.HTTP_403_FORBIDDEN)
        
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """
        - Assign the authenticated user to `created_by`
        """
        serializer.save(created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        - Only admins can update projects.
        - Regular users cannot update any project.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can update projects."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        - Only admins can update projects.
        - Regular users cannot update any project.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can update projects."}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        - Only admins can delete projects.
        - Regular users cannot delete any project.
        """
        if not request.user.is_admin:
            return Response({"error": "Only admins can delete projects."}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        instance.delete()  # Ensure the object is deleted manually

        return Response({"message": "Project deleted successfully."}, status=status.HTTP_200_OK)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        - Admin users can see all tasks.
        - Regular users can only see tasks assigned to them.
        """
        user = self.request.user
        if user.is_admin:  # Check if the user is an admin
            return Task.objects.all()  # Admin can see all tasks
        else:
            return Task.objects.filter(assigned_to=user)  # Regular users see only their tasks

    def destroy(self, request, *args, **kwargs):
        """
        Override the destroy method to return a success message instead of a 204 No Content response.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Task deleted successfully"}, status=status.HTTP_200_OK)