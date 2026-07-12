from rest_framework import serializers
from apps.users.models import User
from .models import Student


class StudentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone']


class StudentSerializer(serializers.ModelSerializer):
    user = StudentUserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'birth_date', 'address', 'enrolled_at']


class StudentCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Student
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'birth_date', 'address']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            password=validated_data.pop('password'),
            first_name=validated_data.pop('first_name', ''),
            last_name=validated_data.pop('last_name', ''),
            phone=validated_data.pop('phone', None),
            role='student',
        )
        student = Student.objects.create(user=user, **validated_data)
        return student