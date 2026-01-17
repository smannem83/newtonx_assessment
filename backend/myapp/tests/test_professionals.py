from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Professional

class ProfessionalAPITests(APITestCase):
    def setUp(self):
        self.professional_data = {
            'full_name': 'John Doe',
            'email': 'john.doe@example.com',
            'phone': '1234567890',
            'company_name': 'Example Corp',
            'job_title': 'Developer',
            'source': 'direct'
        }
        self.professional = Professional.objects.create(**self.professional_data)
        self.list_create_url = reverse('professional-list-create')
        self.bulk_upsert_url = reverse('professional-bulk-upsert')

    def test_create_professional(self):
        """
        Ensure we can create a new professional object.
        """
        data = {
            'full_name': 'Jane Doe',
            'email': 'jane.doe@example.com',
            'phone': '0987654321',
            'source': 'partner'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Professional.objects.count(), 2)
        self.assertEqual(Professional.objects.get(id=2).full_name, 'Jane Doe')

    def test_create_professional_unique_email_fails(self):
        """
        Ensure we cannot create a professional with a non-unique email.
        """
        data = {
            'full_name': 'John Doe Clone',
            'email': self.professional_data['email'],
            'phone': '1111111111',
            'source': 'direct'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_professional_unique_phone_fails(self):
        """
        Ensure we cannot create a professional with a non-unique phone.
        """
        data = {
            'full_name': 'John Doe Clone',
            'email': 'johndoeclone@example.com',
            'phone': self.professional_data['phone'],
            'source': 'direct'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_list_professionals(self):
        """
        Ensure we can list professional objects.
        """
        response = self.client.get(self.list_create_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], self.professional_data['full_name'])

    def test_list_professionals_filtered_by_source(self):
        """
        Ensure we can filter professionals by source.
        """
        Professional.objects.create(full_name='Jane Doe', email='jane.doe@example.com', phone='0987654321', source='partner')
        response = self.client.get(self.list_create_url + '?source=direct', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['source'], 'direct')

    def test_bulk_upsert_create(self):
        """
        Ensure we can create new professionals with the bulk endpoint.
        """
        data = [
            {'full_name': 'Bulk User 1', 'email': 'bulk1@example.com', 'phone': '2222222222', 'source': 'internal'},
            {'full_name': 'Bulk User 2', 'email': 'bulk2@example.com', 'phone': '3333333333', 'source': 'direct'}
        ]
        response = self.client.post(self.bulk_upsert_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['success_count'], 2)
        self.assertEqual(response.data['failure_count'], 0)
        self.assertEqual(Professional.objects.count(), 3)

    def test_bulk_upsert_update(self):
        """
        Ensure we can update existing professionals with the bulk endpoint.
        """
        data = [
            {'full_name': 'John Doe Updated', 'email': self.professional_data['email'], 'phone': '1234567890'}
        ]
        response = self.client.post(self.bulk_upsert_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['success_count'], 1)
        self.professional.refresh_from_db()
        self.assertEqual(self.professional.full_name, 'John Doe Updated')

    def test_bulk_upsert_create_and_update(self):
        """
        Ensure the bulk endpoint can create and update in one call.
        """
        data = [
            {'full_name': 'New User', 'email': 'new@example.com', 'phone': '4444444444'},
            {'full_name': 'John Doe Updated', 'phone': self.professional_data['phone']} # Update existing by phone
        ]
        response = self.client.post(self.bulk_upsert_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['success_count'], 2)
        self.assertEqual(response.data['failure_count'], 0)
        self.professional.refresh_from_db()
        self.assertEqual(self.professional.full_name, 'John Doe Updated')

    def test_bulk_upsert_partial_failure(self):
        """
        Ensure the bulk endpoint handles partial failure.
        """
        data = [
            {'full_name': 'Good User', 'email': 'good@example.com', 'phone': '6666666666'},
            {'full_name': 'Bad User', 'email': 'bad-email', 'phone': '7777777777'} # Invalid email
        ]
        response = self.client.post(self.bulk_upsert_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_207_MULTI_STATUS)
        self.assertEqual(response.data['success_count'], 1)
        self.assertEqual(response.data['failure_count'], 1)
        self.assertIn('email', response.data['errors'][0])
