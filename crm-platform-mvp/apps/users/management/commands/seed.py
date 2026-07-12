from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.courses.models import Course
from apps.groups.models import Group, GroupStudent, Schedule
from apps.attendance.models import Attendance
from apps.assignments.models import Assignment, Submission, Grade
from apps.payments.models import Payment
from apps.notifications.models import Notification
from datetime import date, time, timedelta
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed database with test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # 1. Admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@educrm.uz',
                password='admin12345',
                role='admin'
            )
            self.stdout.write('Admin yaratildi')

        # 2. Teacherlar
        teachers_data = [
            {'username': 'teacher_sardor', 'first_name': 'Sardor', 'last_name': 'Rahimov', 'subject': 'Python', 'salary': 3000000},
            {'username': 'teacher_malika', 'first_name': 'Malika', 'last_name': 'Yusupova', 'subject': 'Django', 'salary': 3500000},
        ]

        teachers = []
        for t in teachers_data:
            if not User.objects.filter(username=t['username']).exists():
                user = User.objects.create_user(
                    username=t['username'],
                    email=f"{t['username']}@educrm.uz",
                    password='test12345',
                    first_name=t['first_name'],
                    last_name=t['last_name'],
                    role='teacher'
                )
                teacher = Teacher.objects.create(
                    user=user,
                    subject=t['subject'],
                    salary=t['salary']
                )
                teachers.append(teacher)
                self.stdout.write(f"Teacher yaratildi: {user.get_full_name()}")
            else:
                teachers.append(Teacher.objects.get(user__username=t['username']))

        # 3. Studentlar
        students_data = [
            {'username': 'student_ali', 'first_name': 'Ali', 'last_name': 'Valiyev', 'address': 'Toshkent'},
            {'username': 'student_aziz', 'first_name': 'Aziz', 'last_name': 'Karimov', 'address': 'Samarqand'},
            {'username': 'student_zulfiya', 'first_name': 'Zulfiya', 'last_name': 'Nazarova', 'address': 'Buxoro'},
            {'username': 'student_jasur', 'first_name': 'Jasur', 'last_name': 'Toshmatov', 'address': 'Namangan'},
            {'username': 'student_nilufar', 'first_name': 'Nilufar', 'last_name': 'Xasanova', 'address': 'Andijon'},
        ]

        students = []
        for s in students_data:
            if not User.objects.filter(username=s['username']).exists():
                user = User.objects.create_user(
                    username=s['username'],
                    email=f"{s['username']}@educrm.uz",
                    password='test12345',
                    first_name=s['first_name'],
                    last_name=s['last_name'],
                    role='student'
                )
                student = Student.objects.create(
                    user=user,
                    birth_date=date(2005, 1, 1),
                    address=s['address']
                )
                students.append(student)
                self.stdout.write(f"Student yaratildi: {user.get_full_name()}")
            else:
                students.append(Student.objects.get(user__username=s['username']))

        # 4. Kurslar
        courses_data = [
            {'name': 'Python dasturlash', 'description': 'Boshlangich Python kursi', 'duration_months': 3, 'price': 500000},
            {'name': 'Django REST Framework', 'description': 'Backend dasturlash', 'duration_months': 4, 'price': 700000},
        ]

        courses = []
        for c in courses_data:
            course, created = Course.objects.get_or_create(
                name=c['name'],
                defaults=c
            )
            courses.append(course)
            if created:
                self.stdout.write(f"Kurs yaratildi: {course.name}")

        # 5. Guruhlar
        groups_data = [
            {'name': 'Python-1', 'course': courses[0], 'teacher': teachers[0], 'start_date': date(2026, 7, 1), 'end_date': date(2026, 10, 1), 'status': 'active'},
            {'name': 'Django-1', 'course': courses[1], 'teacher': teachers[1], 'start_date': date(2026, 7, 1), 'end_date': date(2026, 11, 1), 'status': 'active'},
        ]

        groups = []
        for g in groups_data:
            group, created = Group.objects.get_or_create(
                name=g['name'],
                defaults=g
            )
            groups.append(group)
            if created:
                self.stdout.write(f"Guruh yaratildi: {group.name}")

        # 6. Guruhga studentlar qo'sh
        for i, student in enumerate(students[:3]):
            GroupStudent.objects.get_or_create(
                group=groups[0],
                student=student,
                defaults={'status': 'active'}
            )

        for student in students[3:]:
            GroupStudent.objects.get_or_create(
                group=groups[1],
                student=student,
                defaults={'status': 'active'}
            )

        self.stdout.write('Guruhga studentlar qoshildi')

        # 7. Jadval
        Schedule.objects.get_or_create(
            group=groups[0],
            weekday='monday',
            defaults={'start_time': time(9, 0), 'end_time': time(11, 0), 'room': '101-xona'}
        )
        Schedule.objects.get_or_create(
            group=groups[0],
            weekday='wednesday',
            defaults={'start_time': time(9, 0), 'end_time': time(11, 0), 'room': '101-xona'}
        )
        Schedule.objects.get_or_create(
            group=groups[1],
            weekday='tuesday',
            defaults={'start_time': time(14, 0), 'end_time': time(16, 0), 'room': '202-xona'}
        )
        self.stdout.write('Jadval yaratildi')

        # 8. Davomat
        today = date.today()
        for student in students[:3]:
            Attendance.objects.get_or_create(
                group=groups[0],
                student=student,
                date=today,
                defaults={'status': 'present'}
            )
        self.stdout.write('Davomat yaratildi')

        # 9. Topshiriq
        assignment, created = Assignment.objects.get_or_create(
            title='Python asoslari',
            defaults={
                'group': groups[0],
                'teacher': teachers[0],
                'description': 'O\'zgaruvchilar va funksiyalar haqida yoz',
                'due_date': timezone.now() + timedelta(days=7)
            }
        )
        if created:
            self.stdout.write('Topshiriq yaratildi')

        # 10. To'lovlar
        for student in students[:3]:
            Payment.objects.get_or_create(
                student=student,
                group=groups[0],
                payment_date=today,
                defaults={
                    'amount': 500000,
                    'status': 'paid',
                    'note': 'Iyul oyi'
                }
            )

        Payment.objects.get_or_create(
            student=students[1],
            group=groups[0],
            payment_date=date(2026, 6, 1),
            defaults={
                'amount': 500000,
                'status': 'overdue',
                'note': 'Iyun oyi — kechikdi'
            }
        )
        self.stdout.write("To'lovlar yaratildi")

        # 11. Notificationlar
        for student in students[:3]:
            Notification.objects.get_or_create(
                user=student.user,
                message="Yangi topshiriq qo'shildi",
                defaults={
                    'type': 'assignment',
                    'is_read': False
                }
            )
        self.stdout.write('Notificationlar yaratildi')

        self.stdout.write(self.style.SUCCESS('Seed muvaffaqiyatli tugadi!'))