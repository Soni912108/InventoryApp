from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('api/get_user_info/', views.get_user_info, name='get_user_info'),
    path('api/change_password/', views.change_password, name='change_password'),
]