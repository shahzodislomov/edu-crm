from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsAdmin, IsAdminOrTeacher
from .models import Assignment, Submission, Grade
from .serializers import (
    AssignmentSerializer, AssignmentCreateSerializer,
    SubmissionSerializer, SubmissionCreateSerializer,
    GradeCreateSerializer
)


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related('group', 'teacher__user').all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['group', 'teacher']
    search_fields = ['title']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'submissions']:
            return [IsAuthenticated()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTeacher()]
        if self.action == 'submit':
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AssignmentCreateSerializer
        return AssignmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = AssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        return Response(
            AssignmentSerializer(assignment).data,
            status=status.HTTP_201_CREATED
        )

    # Student topshiriq yuboradi
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        assignment = self.get_object()

        try:
            student = request.user.student_profile
        except Exception:
            return Response(
                {'detail': 'Faqat studentlar topshiriq yuborishi mumkin.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if Submission.objects.filter(assignment=assignment, student=student).exists():
            return Response(
                {'detail': 'Siz allaqachon bu topshiriqni yuborgansiz.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SubmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save(assignment=assignment, student=student)
        return Response(
            SubmissionSerializer(submission).data,
            status=status.HTTP_201_CREATED
        )
    # Topshiriq javoblarini ko'rish
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrTeacher])
    def submissions(self, request, pk=None):
        assignment = self.get_object()
        submissions = Submission.objects.filter(
            assignment=assignment
        ).select_related('student__user', 'grade')
        return Response(SubmissionSerializer(submissions, many=True).data)


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Submission.objects.select_related(
        'assignment', 'student__user'
    ).prefetch_related('grade').all()
    serializer_class = SubmissionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['assignment', 'student', 'status']

    def get_permissions(self):
        return [IsAuthenticated()]

    # Teacher baho qo'yadi
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrTeacher])
    def grade(self, request, pk=None):
        submission = self.get_object()

        if hasattr(submission, 'grade'):
            return Response(
                {'detail': 'Bu topshiriq allaqachon baholangan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not hasattr(request.user, 'teacher_profile'):
            return Response(
                {'detail': 'Faqat teacherlar baho qo\'yishi mumkin.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = GradeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        grade = serializer.save(
            submission=submission,
            teacher=request.user.teacher_profile
        )

        submission.status = 'graded'
        submission.save()

        from .serializers import GradeSerializer
        return Response(
            GradeSerializer(grade).data,
            status=status.HTTP_201_CREATED
        )