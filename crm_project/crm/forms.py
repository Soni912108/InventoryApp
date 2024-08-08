from django import forms
from .models import Cars,Customer,Transaction,Leasing

class CarForm(forms.ModelForm):
    class Meta:
        model = Cars
        fields = ['brand','model','year', 'color','engine', 'more_info', 'total_available_number']


class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['name', 'email', 'phone_number','address']



class TransactionForm(forms.ModelForm):
    number_of_cars = forms.IntegerField(label='Number of Cars')

    class Meta:
        model = Transaction
        fields = ['customer', 'car', 'amount', 'date', 'number_of_cars']


class UpdateTransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ['customer', 'car', 'amount', 'date']



class LeasingForm(forms.ModelForm):
    number_of_cars = forms.IntegerField(label='Number of Cars')
    class Meta:
        model = Leasing
        fields = ['customer', 'car', 'lease_start_date', 'lease_end_date','number_of_cars']


class UpdateLeasingForm(forms.ModelForm):
    class Meta:
        model = Leasing
        fields = ['customer', 'car', 'lease_start_date', 'lease_end_date','amount','mark_as_returned_from_lease']