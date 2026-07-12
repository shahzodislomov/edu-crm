from django.db import models


class Course(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    duration_months = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.name