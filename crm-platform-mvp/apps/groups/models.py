from django.db import models
from apps.courses.models import Course
from apps.teachers.models import Teacher
from apps.students.models import Student


class Group(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        FINISHED = 'finished', 'Finished'
        PENDING = 'pending', 'Pending'

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='groups')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='groups')
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return self.name


class GroupStudent(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        LEFT = 'left', 'Left'
        GRADUATED = 'graduated', 'Graduated'

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='group_students')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='group_students')
    joined_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        unique_together = ('group', 'student')

    def __str__(self):
        return f"{self.student} - {self.group}"



class Schedule(models.Model):
    class Weekday(models.TextChoices):
        MONDAY = 'monday', 'Dushanba'
        TUESDAY = 'tuesday', 'Seshanba'
        WEDNESDAY = 'wednesday', 'Chorshanba'
        THURSDAY = 'thursday', 'Payshanba'
        FRIDAY = 'friday', 'Juma'
        SATURDAY = 'saturday', 'Shanba'
        SUNDAY = 'sunday', 'Yakshanba'

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='schedules')
    weekday = models.CharField(max_length=20, choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.group} - {self.weekday} {self.start_time}"