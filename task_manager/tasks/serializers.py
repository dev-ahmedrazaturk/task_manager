from rest_framework import serializers
from .models import Task, Project, User, Comment
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_admin', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}  # Ensure password is not exposed in API responses

    def create(self, validated_data):
        """
        Create a new user and hash the password.
        """
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)  # ✅ Hash password
        user.save()
        return user

    def update(self, instance, validated_data):
        """
        Update user details and hash password if provided.
        """
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)  # Update other fields

        if password:  # ✅ Ensure password is hashed when updating
            instance.set_password(password)

        instance.save()
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims (user details) to the token
        token['username'] = user.username
        token['email'] = user.email
        token['is_admin'] = user.is_admin

        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_admin']

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            is_admin=validated_data.get('is_admin', False),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class ProjectSerializer(serializers.ModelSerializer):
    assigned_users = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ["created_by"]  # Make sure this field is read-only

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(many=True, read_only=True)
    project = ProjectSerializer(read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'priority', 'status', 'project', 'assigned_to']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    task_id = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), write_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'user', 'task_id', 'created_at', 'updated_at']
    