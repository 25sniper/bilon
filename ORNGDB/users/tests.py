from django.test import TestCase, Client
from django.urls import reverse
from users.models import User
from products.models import Product

class UserAdminDashboardTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username='admin',
            password='adminpassword',
            role='admin'
        )
        self.agent = User.objects.create_user(
            username='agent',
            password='agentpassword',
            role='agent'
        )
        self.customer = User.objects.create_user(
            username='customer',
            password='customerpassword',
            role='customer'
        )
        self.product = Product.objects.create(
            name='Banana',
            price=60.00,
            available=True,
            agent=self.agent
        )

    def test_admin_toggle_product_requires_agent(self):
        url = reverse('admin_toggle_product', args=[self.product.id])
        
        # Unauthenticated user
        response = self.client.post(url)
        self.assertEqual(response.status_code, 302) # Redirect to login
        
        # Authenticated non-agent (customer)
        self.client.login(username='customer', password='customerpassword')
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403) # Forbidden

        # Authenticated non-agent (admin)
        self.client.login(username='admin', password='adminpassword')
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403) # Forbidden

    def test_admin_toggle_product_success(self):
        self.client.login(username='agent', password='agentpassword')
        url = reverse('admin_toggle_product', args=[self.product.id])
        
        # Initially available=True
        self.assertTrue(self.product.available)
        
        # Toggle 1: becomes False
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'available': False, 'name': 'Banana'})
        
        self.product.refresh_from_db()
        self.assertFalse(self.product.available)
        
        # Toggle 2: becomes True
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'available': True, 'name': 'Banana'})
        
        self.product.refresh_from_db()
        self.assertTrue(self.product.available)

