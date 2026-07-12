from django.db import models
from apps.groups.models import Group
from apps.students.models import Student


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Keldi'
        ABSENT = 'absent', 'Kelmadi'
        LATE = 'late', 'Kechikdi'

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    note = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('group', 'student', 'date')

    def __str__(self):
        return f"{self.student} - {self.date} - {self.status}"