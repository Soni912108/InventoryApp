# home/views.py

from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .forms import CustomUserCreationForm  # Import the custom form

@api_view(['POST'])
def login_view(request):
    form = AuthenticationForm(request, data=request.data)
    if form.is_valid():
        user = form.get_user()
        auth_login(request, user)
        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': form.cleaned_data['username'],
        })
    else:
        # Extract the main error message from the form errors
        errors = form.errors.get('__all__', [])
        error_message = errors[0] if errors else 'Invalid credentials'
        return JsonResponse({'error': error_message}, status=400)
    
    

@api_view(['POST'])
def register_view(request):
    form = CustomUserCreationForm(data=request.data)

    if form.is_valid():
        user = form.save()
        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            'message': 'User created successfully',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': form.cleaned_data['username'],
        }, status=201)
    else:
        # Extract the main error message from the form errors
        errors = form.errors.get('__all__', [])
        error_message = errors[0] if errors else 'Registration failed'
        return JsonResponse({'error':error_message}, status=400)


