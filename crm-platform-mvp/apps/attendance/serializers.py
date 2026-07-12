from rest_framework import serializers
from .models import Attendance
from apps.students.models import Student


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'group', 'group_name', 'student', 'student_name', 'date', 'status', 'note']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class AttendanceBulkSerializer(serializers.Serializer):
    date = serializers.DateField()
    group = serializers.IntegerField()
    attendances = serializers.ListField(
        child=serializers.DictField()
    )

    def validate(self, data):
        attendances = data.get('attendances', [])
        for item in attendances:
            if 'student' not in item or 'status' not in item:
                raise serializers.ValidationError(
                    "Har bir attendance da 'student' va 'status' bo'lishi kerak."
                )
        return data