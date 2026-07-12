from django.db import models
from apps.students.models import Student
from apps.groups.models import Group


class Payment(models.Model):
    class Status(models.TextChoices):
        PAID = 'paid', 'Toʻlandi'
        PENDING = 'pending', 'Kutilmoqda'
        OVERDUE = 'overdue', 'Muddati oʻtgan'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.amount} - {self.status}"