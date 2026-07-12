from django.db import models
from apps.users.models import User


class Notification(models.Model):
    class Type(models.TextChoices):
        PAYMENT = 'payment', "To'lov"
        ATTENDANCE = 'attendance', 'Davomat'
        ASSIGNMENT = 'assignment', 'Topshiriq'
        GENERAL = 'general', 'Umumiy'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.GENERAL)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.type} - {self.is_read}"