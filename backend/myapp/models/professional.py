from django.db import models
from django.db.models import Q, CheckConstraint

class Professional(models.Model):
    SOURCE_CHOICES = [
        ('direct', 'Direct'),
        ('partner', 'Partner'),
        ('internal', 'Internal'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    job_title = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='direct', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name

    class Meta:
        constraints = [
            CheckConstraint(
                condition=Q(email__isnull=False) | Q(phone__isnull=False), name='email_or_phone_not_null'
            ),
        ]
