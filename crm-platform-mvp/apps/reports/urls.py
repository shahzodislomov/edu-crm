from django.urls import path
from .views import MonthlyReportView, TeacherReportView, StudentReportView

urlpatterns = [
    path('monthly/', MonthlyReportView.as_view(), name='monthly-report'),
    path('teachers/', TeacherReportView.as_view(), name='teacher-report'),
    path('students/', StudentReportView.as_view(), name='student-report'),
]