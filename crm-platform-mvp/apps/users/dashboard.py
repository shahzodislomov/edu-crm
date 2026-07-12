from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum
from apps.users.permissions import IsAdmin
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.groups.models import Group
from apps.courses.models import Course
from apps.attendance.models import Attendance
from apps.assignments.models import Assignment, Submission
from apps.payments.models import Payment
from apps.notifications.models import Notification


class DashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        # Umumiy sonlar
        total_students = Student.objects.count()
        total_teachers = Teacher.objects.count()
        total_groups = Group.objects.count()
        total_courses = Course.objects.count()

        # Guruh statuslari
        active_groups = Group.objects.filter(status='active').count()
        finished_groups = Group.objects.filter(status='finished').count()

        # To'lovlar
        total_paid = Payment.objects.filter(
            status='paid'
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_pending = Payment.objects.filter(
            status='pending'
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_overdue = Payment.objects.filter(
            status='overdue'
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_debtors = Payment.objects.filter(
            status__in=['pending', 'overdue']
        ).values('student').distinct().count()

        # Davomat
        total_attendance = Attendance.objects.count()
        present_count = Attendance.objects.filter(status='present').count()
        absent_count = Attendance.objects.filter(status='absent').count()
        late_count = Attendance.objects.filter(status='late').count()

        attendance_rate = round(
            (present_count / total_attendance * 100) if total_attendance > 0 else 0, 1
        )

        # Topshiriqlar
        total_assignments = Assignment.objects.count()
        total_submissions = Submission.objects.count()
        graded_submissions = Submission.objects.filter(status='graded').count()

        # O'qilmagan xabarlar
        unread_notifications = Notification.objects.filter(is_read=False).count()

        return Response({
            'overview': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_groups': total_groups,
                'total_courses': total_courses,
            },
            'groups': {
                'active': active_groups,
                'finished': finished_groups,
            },
            'payments': {
                'total_paid': total_paid,
                'total_pending': total_pending,
                'total_overdue': total_overdue,
                'total_debtors': total_debtors,
            },
            'attendance': {
                'total': total_attendance,
                'present': present_count,
                'absent': absent_count,
                'late': late_count,
                'attendance_rate': f"{attendance_rate}%",
            },
            'assignments': {
                'total': total_assignments,
                'submissions': total_submissions,
                'graded': graded_submissions,
            },
            'notifications': {
                'unread': unread_notifications,
            }
        })