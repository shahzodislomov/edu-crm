from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.users.permissions import IsAdmin
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Notification.objects.all()
        return Notification.objects.filter(user=user)


    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'read', 'read_all']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    # O'qildi deb belgilash
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    # Barcha xabarlarni o'qildi deb belgilash
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def read_all(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'detail': 'Barcha xabarlar o\'qildi.'})