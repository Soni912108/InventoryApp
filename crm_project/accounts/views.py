# accounts/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer,ChangePasswordSerializer
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    if request.method == 'GET':
        user = request.user  # Get the currently authenticated user
        if not user:
            return JsonResponse({'error': 'User not found.'}, status=status.HTTP_204_NO_CONTENT)

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)


 
# view to change password
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    print(request.body)
    serializer = ChangePasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        old_password = serializer.validated_data.get('old_password')
        new_password = serializer.validated_data.get('new_password')
        user = request.user
        
        # Validate old password
        if not user.check_password(old_password):
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password and save
        try:
            user.set_password(new_password)
            user.save()
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
