from django.contrib import admin
from .models import Group, GroupStudent, Schedule

admin.site.register(Group)
admin.site.register(GroupStudent)
admin.site.register(Schedule)