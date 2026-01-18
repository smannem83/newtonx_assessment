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
    serializer_class = ProfessionalSerializer # For schema generation
    
    def post(self, request, *args, **kwargs):
        profiles = request.data
        if not isinstance(profiles, list):
            return Response({"error": "Request body must be a list of profiles."}, status=status.HTTP_400_BAD_REQUEST)

        success_count = 0
        failure_count = 0
        errors = []

        for i, profile_data in enumerate(profiles):
            email = profile_data.get('email')
            phone = profile_data.get('phone')

            instance = None
            if email:
                instance = Professional.objects.filter(email=email).first() # Find by email
            if not instance and phone:
                instance = Professional.objects.filter(phone=phone).first() # Find by phone if email not found

            if instance:
                serializer = ProfessionalSerializer(instance, data=profile_data, partial=True)
            else:
                serializer = ProfessionalSerializer(data=profile_data)

            if serializer.is_valid():
                serializer.save()
                success_count += 1
            else:
                failure_count += 1 # Increment failure count
                error_detail = {"index": i, "validation_errors": serializer.errors}
                if email:
                    error_detail["email"] = email
                if phone:
                    error_detail["phone"] = phone
                errors.append(error_detail) # Collect detailed errors

        return Response({
            "success_count": success_count,
            "failure_count": failure_count,
            "errors": errors
        }, status=status.HTTP_207_MULTI_STATUS if failure_count > 0 else status.HTTP_201_CREATED)
