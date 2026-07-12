from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.users.permissions import IsAdmin
from .models import Student
from .serializers import StudentSerializer, StudentCreateSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user').all()
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer

    def create(self, request, *args, **kwargs):
        serializer = StudentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        return Response(
            StudentSerializer(student).data,
            status=status.HTTP_201_CREATED
        )