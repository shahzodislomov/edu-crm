from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsAdmin, IsAdminOrTeacher
from apps.groups.models import Group
from .models import Attendance
from .serializers import AttendanceSerializer, AttendanceBulkSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related(
        'group', 'student__user'
    ).all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['group', 'student', 'date', 'status']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my']:
            return [IsAuthenticated()]
        if self.action in ['create', 'update', 'partial_update', 'bulk']:
            return [IsAdminOrTeacher()]
        return [IsAdmin()]

    # Bir guruh uchun bir kunda davomat belgilash
    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrTeacher])
    def bulk(self, request):
        serializer = AttendanceBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data['date']
        group_id = serializer.validated_data['group']
        attendances_data = serializer.validated_data['attendances']

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'detail': 'Guruh topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        created = []
        for item in attendances_data:
            att, _ = Attendance.objects.update_or_create(
                group=group,
                student_id=item['student'],
                date=date,
                defaults={'status': item['status'], 'note': item.get('note', '')}
            )
            created.append(att)

        return Response(
            AttendanceSerializer(created, many=True).data,
            status=status.HTTP_201_CREATED
        )

    # Student o'z davomatini ko'radi
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        if not hasattr(request.user, 'student_profile'):
            return Response(
                {'detail': 'Siz student emassiz.'},
                status=status.HTTP_403_FORBIDDEN
            )
        attendances = Attendance.objects.filter(
            student=request.user.student_profile
        ).select_related('group')
        return Response(AttendanceSerializer(attendances, many=True).data)