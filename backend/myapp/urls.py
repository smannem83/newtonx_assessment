from django.urls import path
from .views import ProfessionalListCreate, ProfessionalBulkUpsert

urlpatterns = [
    path('professionals/', ProfessionalListCreate.as_view(), name='professional-list-create'),
    path('professionals/bulk', ProfessionalBulkUpsert.as_view(), name='professional-bulk-upsert'),
]
