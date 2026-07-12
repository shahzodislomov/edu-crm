from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from apps.users.permissions import IsAdmin
from apps.payments.models import Payment
from apps.teachers.models import Teacher
from apps.students.models import Student
from apps.groups.models import Group, GroupStudent
from apps.attendance.models import Attendance


class MonthlyReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        if not year or not month:
            return Response({'detail': 'year va month parametrlari kerak.'}, status=400)

        year = int(year)
        month = int(month)

        # Kirim — to'langan to'lovlar
        paid_payments = Payment.objects.filter(
            payment_date__year=year,
            payment_date__month=month,
            status='paid'
        )
        total_income = paid_payments.aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Guruh bo'yicha kirim
        income_by_group = paid_payments.values(
            'group__name'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # Chiqim — o'qituvchilar maoshi
        total_salary = Teacher.objects.aggregate(
            total=Sum('salary')
        )['total'] or 0

        # O'qituvchilar ro'yxati maosh bilan
        teachers_salary = Teacher.objects.select_related('user').values(
            'user__first_name',
            'user__last_name',
            'salary',
            'subject'
        )

        # Qarzdorlik
        total_debt = Payment.objects.filter(
            payment_date__year=year,
            payment_date__month=month,
            status__in=['pending', 'overdue']
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Sof foyda
        net_profit = total_income - total_salary

        return Response({
            'period': f"{year}-{str(month).zfill(2)}",
            'income': {
                'total': total_income,
                'by_group': list(income_by_group),
            },
            'expense': {
                'total_salary': total_salary,
                'teachers': list(teachers_salary),
            },
            'debt': {
                'total': total_debt,
            },
            'net_profit': net_profit,
        })


class TeacherReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        teachers = Teacher.objects.select_related('user').prefetch_related('groups').all()

        result = []
        for teacher in teachers:
            groups = Group.objects.filter(teacher=teacher)
            total_students = GroupStudent.objects.filter(
                group__in=groups,
                status='active'
            ).count()

            result.append({
                'id': teacher.id,
                'full_name': teacher.user.get_full_name(),
                'subject': teacher.subject,
                'salary': teacher.salary,
                'total_groups': groups.count(),
                'total_students': total_students,
                'groups': list(groups.values('id', 'name', 'status')),
            })

        return Response(result)


class StudentReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        students = Student.objects.select_related('user').all()

        result = []
        for student in students:
            # Guruhlar
            group_students = GroupStudent.objects.filter(
                student=student,
                status='active'
            ).select_related('group')

            # Davomat foizi
            total_attendance = Attendance.objects.filter(student=student).count()
            present_count = Attendance.objects.filter(
                student=student,
                status='present'
            ).count()

            attendance_rate = round(
                (present_count / total_attendance * 100)
                if total_attendance > 0 else 0, 1
            )

            # To'lov holati
            last_payment = Payment.objects.filter(
                student=student
            ).order_by('-payment_date').first()

            result.append({
                'id': student.id,
                'full_name': student.user.get_full_name(),
                'phone': student.user.phone,
                'groups': [
                    {'id': gs.group.id, 'name': gs.group.name}
                    for gs in group_students
                ],
                'attendance_rate': f"{attendance_rate}%",
                'payment_status': last_payment.status if last_payment else 'no_payment',
                'last_payment_date': last_payment.payment_date if last_payment else None,
            })

        return Response(result)