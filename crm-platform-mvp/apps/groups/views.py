from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsAdmin, IsAdminOrTeacher
from .models import Group, GroupStudent, Schedule
from .serializers import (
    GroupSerializer, GroupCreateSerializer,
    GroupStudentSerializer, AddStudentToGroupSerializer,
    ScheduleSerializer
)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.select_related('course', 'teacher__user').prefetch_related('schedules').all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'course', 'teacher']
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return GroupCreateSerializer
        return GroupSerializer

    def create(self, request, *args, **kwargs):
        serializer = GroupCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(
            GroupSerializer(group).data,
            status=status.HTTP_201_CREATED
        )

    # Guruhga o'quvchi qo'shish
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def add_student(self, request, pk=None):
        group = self.get_object()
        serializer = AddStudentToGroupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.validated_data['student']

        if GroupStudent.objects.filter(group=group, student=student).exists():
            return Response(
                {'detail': 'Bu o\'quvchi allaqachon guruhda.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        group_student = GroupStudent.objects.create(group=group, student=student)
        return Response(
            GroupStudentSerializer(group_student).data,
            status=status.HTTP_201_CREATED
        )

    # Guruh o'quvchilar ro'yxati
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrTeacher])
    def students(self, request, pk=None):
        group = self.get_object()
        group_students = GroupStudent.objects.filter(group=group).select_related('student__user')
        return Response(GroupStudentSerializer(group_students, many=True).data)

    # Guruh jadvalini qo'shish
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def add_schedule(self, request, pk=None):
        group = self.get_object()
        serializer = ScheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schedule = serializer.save(group=group)
        return Response(
            ScheduleSerializer(schedule).data,
            status=status.HTTP_201_CREATED
        )