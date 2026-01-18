from rest_framework import serializers
from ..models import Professional
from django.db import IntegrityError

class ProfessionalSerializer(serializers.ModelSerializer):
    # Phone field is optional and can be blank
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = Professional
        fields = '__all__'
        extra_kwargs = {
            'company_name': {'required': False},
            'job_title': {'required': False},
        }

    def validate(self, data):
        """
        Performs cross-field validation for Professional instances:
        1. Ensures that at least either 'email' or 'phone' is provided.
        2. Cleans the 'phone' number by stripping non-numeric characters if it's provided.
        3. Validates the cleaned 'phone' number's length ONLY if 'email' is NOT provided.
        """
        email = data.get('email') # Get email from data
        phone = data.get('phone') # Get phone from data (can be '' or None)

        # Either email or phone must be provided
        if not email and not phone:
            raise serializers.ValidationError("Either email or phone must be provided.")

        # Clean and conditionally validate phone
        if phone: # If phone has a value (not '', not None)
            cleaned_phone = ''.join(filter(str.isdigit, phone))
            if not email: # Validate length only if email is NOT provided
                if not (10 <= len(cleaned_phone) <= 15):
                    raise serializers.ValidationError({"phone": "Phone number must be between 10 and 15 digits."})
            data['phone'] = cleaned_phone
        elif phone == '': # If phone is an empty string, set to None for DB
            data['phone'] = None

        return data

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except IntegrityError as e: # Catch database integrity errors
            if 'email_or_phone_not_null' in str(e):
                raise serializers.ValidationError(
                    {"non_field_errors": "Either email or phone must be provided."}
                )
            if 'UNIQUE constraint' in str(e):
                if 'email' in str(e):
                    raise serializers.ValidationError({"email": "This email already exists."})
                if 'phone' in str(e):
                    raise serializers.ValidationError({"phone": "This phone number already exists."})
            raise # Re-raise other IntegrityErrors not related to this constraint

    def update(self, instance, validated_data):
        try:
            return super().update(instance, validated_data)
        except IntegrityError as e: # Catch database integrity errors
            if 'email_or_phone_not_null' in str(e):
                raise serializers.ValidationError(
                    {"non_field_errors": "Either email or phone must be provided."}
                )
            if 'UNIQUE constraint' in str(e):
                if 'email' in str(e):
                    raise serializers.ValidationError({"email": "This email already exists."})
                if 'phone' in str(e):
                    raise serializers.ValidationError({"phone": "This phone number already exists."})
            raise # Re-raise other IntegrityErrors not related to this constraint
