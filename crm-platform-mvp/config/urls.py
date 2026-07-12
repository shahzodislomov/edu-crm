from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from apps.users.dashboard import DashboardView


urlpatterns = [
    path('admin/', admin.site.urls),

    # Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Apps
    path('api/auth/', include('apps.users.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/teachers/', include('apps.teachers.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/groups/', include('apps.groups.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/', include('apps.assignments.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/reports/', include('apps.reports.urls')),
]