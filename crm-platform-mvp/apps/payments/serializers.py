from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'group',
            'group_name', 'amount', 'payment_date',
            'status', 'note', 'created_at'
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['student', 'group', 'amount', 'payment_date', 'status', 'note']