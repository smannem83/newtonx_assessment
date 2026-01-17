from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Professional
from ..serializers import ProfessionalSerializer

class ProfessionalListCreate(generics.ListCreateAPIView):
    serializer_class = ProfessionalSerializer

    def get_queryset(self):
        queryset = Professional.objects.all()
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        return queryset

class ProfessionalBulkUpsert(APIView):
    def post(self, request, *args, **kwargs):
        profiles = request.data
        if not isinstance(profiles, list):
            return Response({"error": "Request body must be a list of profiles."}, status=status.HTTP_400_BAD_REQUEST)

        success_count = 0
        failure_count = 0
        errors = []

        for profile_data in profiles:
            email = profile_data.get('email')
            phone = profile_data.get('phone')
            
            instance = None
            if email:
                instance = Professional.objects.filter(email=email).first()
            if not instance and phone:
                instance = Professional.objects.filter(phone=phone).first()

            if instance:
                serializer = ProfessionalSerializer(instance, data=profile_data, partial=True)
            else:
                serializer = ProfessionalSerializer(data=profile_data)

            if serializer.is_valid():
                serializer.save()
                success_count += 1
            else:
                failure_count += 1
                errors.append(serializer.errors)

        return Response({
            "success_count": success_count,
            "failure_count": failure_count,
            "errors": errors
        }, status=status.HTTP_207_MULTI_STATUS if failure_count > 0 else status.HTTP_201_CREATED)
