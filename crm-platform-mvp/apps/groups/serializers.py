from rest_framework import serializers
from apps.courses.models import Course
from apps.teachers.models import Teacher
from apps.students.models import Student
from .models import Group, GroupStudent, Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'weekday', 'start_time', 'end_time', 'room']


class GroupSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    schedules = ScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'course', 'course_name',
            'teacher', 'teacher_name', 'start_date',
            'end_date', 'status', 'schedules'
        ]

    def get_teacher_name(self, obj):
        if obj.teacher:
            return obj.teacher.user.get_full_name() or obj.teacher.user.username
        return None


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name', 'course', 'teacher', 'start_date', 'end_date', 'status']


class GroupStudentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.IntegerField(source='student.id', read_only=True)

    class Meta:
        model = GroupStudent
        fields = ['id', 'student_id', 'student_name', 'joined_at', 'status']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class AddStudentToGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupStudent
        fields = ['student']