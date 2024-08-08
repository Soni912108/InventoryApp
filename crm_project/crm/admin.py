# crm_app/admin.py

from django.contrib import admin
from .models import Cars




# @admin.register(Cars)
# class CustomerAdmin(admin.ModelAdmin):
#     list_display = ('name','model','year','color','more_info','total_available_number','is_still_in_stock')

# @admin.register(Car)
# class CarAdmin(admin.ModelAdmin):
#     list_display = ('make', 'model', 'year')


# @admin.register(Transaction)
# class TransactionAdmin(admin.ModelAdmin):
#     list_display = ('amount', 'date')

# @admin.register(Leasing)
# class LeasingAdmin(admin.ModelAdmin):
#     list_display = ('car', 'lease_start_date', 'lease_end_date')

