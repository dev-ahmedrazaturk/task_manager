from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommentViewSet, CustomTokenObtainPairView, RegisterView, LogoutView, TaskViewSet, ProjectViewSet, UserManagementViewSet, UserProfileView, UserViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='users')
# router.register(r'users', UserViewSet, basename='user')
router.register(r'projects', ProjectViewSet, basename="projects")
router.register(r'tasks', TaskViewSet, basename="tasks")
router.register(r'comments', CommentViewSet, basename="comments")

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
