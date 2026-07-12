from rest_framework import serializers
from .models import Assignment, Submission, Grade
from apps.students.models import Student


class AssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'group', 'group_name', 'teacher',
            'teacher_name', 'title', 'description',
            'due_date', 'created_at'
        ]

    def get_teacher_name(self, obj):
        return obj.teacher.user.get_full_name() or obj.teacher.user.username


class AssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['group', 'teacher', 'title', 'description', 'due_date']


class GradeSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = ['id', 'score', 'feedback', 'graded_at', 'teacher_name']

    def get_teacher_name(self, obj):
        return obj.teacher.user.get_full_name() or obj.teacher.user.username


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    grade = GradeSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title',
            'student', 'student_name', 'content',
            'submitted_at', 'status', 'grade'
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['content']


class GradeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['score', 'feedback']