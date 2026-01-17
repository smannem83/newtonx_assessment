from rest_framework import serializers
from ..models import Professional

class ProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = '__all__'
        extra_kwargs = {
            'company_name': {'required': False},
            'job_title': {'required': False},
        }

    def validate(self, data):
        """
        Check that either email or phone is provided.
        """
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError("Either email or phone must be provided.")
        return data

    def validate_phone(self, value):
        """
        Strip non-numeric characters and validate length.
        """
        cleaned_number = ''.join(filter(str.isdigit, value))
        if not (10 <= len(cleaned_number) <= 15):
            raise serializers.ValidationError("Phone number must be between 10 and 15 digits.")
        return cleaned_number
