from . import views
from django.urls import path

app_name = 'crm'

# all of the paths have crm/ before them. example crm/cars to show all the cars and their data  
urlpatterns = [ 
    # company
    path('api/create_company/', views.create_company, name='create_company'),
    path('api/get_company/', views.get_company, name='get_company'),
    # customers
    path('api/customers/', views.customer_details, name='customer_details'),
    path('api/add_customer/', views.add_customer, name='add_customer'),
    path('api/update_customer/<int:user_id>/', views.update_customer, name="update_customer"),
    path('api/delete_customer/<int:user_id>/', views.delete_customer, name='delete_customer'),
    # cars get_car_options
    path('api/cars/', views.show_all_cars, name='show_all_cars'),
    path('api/add_car/', views.add_car, name='add_car'),
    path('api/update_car/<int:car_id>/', views.update_car, name='update_car'),
    path('api/delete_car/<int:car_id>/', views.delete_car, name='delete_car'),
    # sell
    path('api/transactions/', views.transaction_list, name='transaction_list'),
    path('api/add_transaction/', views.add_transaction, name='add_transaction'),
    path('api/update_transaction/<int:transaction_id>/', views.update_transaction, name='update_transaction'),
    path('api/delete_transaction/<int:transaction_id>/', views.delete_transaction, name='delete_transaction'),
    path('api/sold/', views.sold, name='sold'),
    # lease
    path('api/leases/', views.leasing_list, name='leasing_list'),
    path('api/add_lease/', views.add_lease, name='add_lease'),
    path('api/update_lease/<int:lease_id>/', views.update_lease, name='update_lease'),
    path('api/delete_lease/<int:lease_id>/', views.delete_lease, name='delete_lease'),
    path('api/update_mark_as_returned/<int:lease_id>/', views.update_mark_as_returned, name='update_mark_as_returned'),
    
]