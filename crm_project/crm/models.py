from django.db import models
from decimal import Decimal
from django.utils.crypto import get_random_string
from django.contrib.auth.models import User


class Company(models.Model):
    name = models.CharField(max_length=100, unique=True)
    address = models.TextField(null=True)
    users = models.ManyToManyField(User, related_name='companies',null=True, blank=True)

    # Field to represent the owner of the company
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_companies', null=True, blank=True)

    def __str__(self):
        return self.name



class Cars(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    brand = models.CharField(max_length=50,null=True)
    model = models.CharField(max_length=50,null=True)
    year = models.IntegerField(null=True)
    color = models.CharField(max_length=20,null=True)
    engine =  models.CharField(max_length=20,null=True)
    more_info = models.TextField(null=True)
    total_available_number = models.IntegerField(null=True)
    number_of_cars_in_lease = models.IntegerField(null=True)
    is_still_in_stock = models.BooleanField(null=True)
    sold_cars = models.IntegerField(default=False)

    def __str__(self):
        return f"{self.brand}"

    def is_still_in_stock_method(self):
        return self.total_available_number > 0


    def sold(self, number_of_sold):
        if self.total_available_number >= number_of_sold: #check if there are any cars left to sell
            self.total_available_number -= number_of_sold
            self.sold_cars += 1
            self.save()  # Save the updated value to the database
        else:
            # Handle the case where the available number is less than the sold quantity
            raise ValueError("Not enough cars available for sale.")

    def lease(self, number_of_lease):
        if self.total_available_number >= number_of_lease:
            self.total_available_number -= number_of_lease
            if self.number_of_cars_in_lease is not None:
                self.number_of_cars_in_lease += number_of_lease
            else:
                self.number_of_cars_in_lease = number_of_lease
            self.save()  # Save the updated value to the database
        else:
            # Handle the case where the available number is less than the leased quantity
            raise ValueError("Not enough cars available for lease.")


    def save(self, *args, **kwargs):
        # Calculate the is_still_in_stock only if it's not set or needs an update
        if self.is_still_in_stock is None or self.is_still_in_stock != self.is_still_in_stock_method():
            self.is_still_in_stock = self.is_still_in_stock_method()

        super().save(*args, **kwargs)




class Customer(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.IntegerField()
    address = models.TextField()
    nr_of_bought_cars = models.IntegerField(default=0)
    bought_cars = models.TextField(default='')
    nr_of_leased_cars = models.IntegerField(default=0)
    leased_cars = models.TextField(default='')

    cars = models.ForeignKey('Cars', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.name}"




class Transaction(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE)
    car = models.ForeignKey('Cars', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    receipt = models.CharField(max_length=50, unique=True)  # Unique constraint for the receipt ID
    

    def generate_receipt_id(self):
        # Combines 'R-Nr-' with a random 6-digit number
        return f'R-Nr-{get_random_string(length=6, allowed_chars="1234567890")}'

    def map_bought_cars_by_customer(self):
        self.customer.nr_of_bought_cars += 1
        self.customer.bought_cars += f"{self.car.brand} {self.car.model} ({self.car.year})"
        self.customer.save()


    def save(self, *args, **kwargs):
        # Generate receipt ID 
        if not self.receipt:
            self.receipt = self.generate_receipt_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Transaction #{self.id} - Receipt: {self.receipt} - {self.customer.name} "



class Leasing(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE)
    car = models.ForeignKey('Cars', on_delete=models.CASCADE)
    lease_start_date = models.DateField()
    lease_end_date = models.DateField()
    amount = models.DecimalField(default=0.0, max_digits=10, decimal_places=2, null=True)
    mark_as_returned_from_lease = models.BooleanField(default=False, null=True, blank=True)

    def calculate_amount(self):
        # fixed cost per day, $20
        cost_per_day = Decimal('20')
        # Calculate the number of days between start and end dates
        num_days = (self.lease_end_date - self.lease_start_date).days + 1
        # Calculate the total amount
        total_amount = cost_per_day * num_days

        return total_amount

    def mark_car_as_returned(self):
        if self.mark_as_returned_from_lease:
            self.car.number_of_cars_in_lease -= 1
            self.car.total_available_number += 1
            self.car.save()

    def un_mark_car_as_returned(self):
        if not self.mark_as_returned_from_lease:
            self.car.number_of_cars_in_lease += 1
            self.car.total_available_number -= 1
            self.car.save()

    def map_leased_cars_by_customer(self):
        self.customer.nr_of_leased_cars += 1
        self.customer.leased_cars += f"{self.car.brand} {self.car.model} ({self.car.year})"
        self.customer.save()

    def save(self, *args, **kwargs):
        # Calculate the amount only if it's not set or needs an update
        self.amount = self.calculate_amount()

        # Check if mark_as_returned_from_lease has changed
        if self.pk is not None:
            orig = Leasing.objects.get(pk=self.pk)
            if orig.mark_as_returned_from_lease != self.mark_as_returned_from_lease:
                if self.mark_as_returned_from_lease:
                    self.mark_car_as_returned()
                else:
                    self.un_mark_car_as_returned()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Leasing #{self.id} - {self.customer.name} - {self.car.brand} - Amount: ${self.amount}"






