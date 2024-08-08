# #crm_project\crm\serializers.py

from rest_framework import serializers
from .models import Transaction, Customer, Cars,Leasing,Company


class CompanySerializer(serializers.ModelSerializer):
    owner_username = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['name', 'address', 'owner_username']

    def get_owner_username(self, obj):
        return obj.owner.username if obj.owner else None


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id','name', 'email', 'phone_number', 'address','company']



class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cars
        fields = ['id', 'brand', 'model', 'year', 'color', 'engine', 
                  'more_info', 'total_available_number', 'number_of_cars_in_lease',
                  'is_still_in_stock', 'company']


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['customer', 'car', 'amount', 'date','company']



class TransactionReadSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    car = CarSerializer()

    class Meta:
        model = Transaction
        fields = '__all__'



class LeasingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leasing
        fields = ['customer', 'car', 'lease_start_date','lease_end_date','company']



class LeasingReadSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    car = CarSerializer()

    class Meta:
        model = Leasing
        fields = '__all__'

