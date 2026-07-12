from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from apps.users.permissions import IsAdmin
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related(
        'student__user', 'group'
    ).all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['student', 'group', 'status', 'payment_date']
    search_fields = ['student__user__first_name', 'student__user__last_name']

    def get_permissions(self):
        if self.action == 'my':
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PaymentCreateSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED
        )

    # Qarzdorlar ro'yxati
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def debtors(self, request):
        debtors = Payment.objects.filter(
            status__in=['pending', 'overdue']
        ).select_related('student__user', 'group')
        return Response(PaymentSerializer(debtors, many=True).data)

    # Daromad statistikasi
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def summary(self, request):
        total_paid = Payment.objects.filter(
            status='paid'
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_pending = Payment.objects.filter(
            status='pending'
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_overdue = Payment.objects.filter(
            status='overdue'
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'total_paid': total_paid,
            'total_pending': total_pending,
            'total_overdue': total_overdue,
        })

    # Student o'z to'lovlarini ko'radi
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        if not hasattr(request.user, 'student_profile'):
            return Response(
                {'detail': 'Siz student emassiz.'},
                status=status.HTTP_403_FORBIDDEN
            )
        payments = Payment.objects.filter(
            student=request.user.student_profile
        ).select_related('group')
        return Response(PaymentSerializer(payments, many=True).data)