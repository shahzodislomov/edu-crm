from rest_framework import serializers
from apps.users.models import User
from .models import Teacher


class TeacherUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone']


class TeacherSerializer(serializers.ModelSerializer):
    user = TeacherUserSerializer(read_only=True)

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'subject', 'salary']


class TeacherCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Teacher
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'subject', 'salary']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            password=validated_data.pop('password'),
            first_name=validated_data.pop('first_name', ''),
            last_name=validated_data.pop('last_name', ''),
            phone=validated_data.pop('phone', None),
            role='teacher',
        )
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher