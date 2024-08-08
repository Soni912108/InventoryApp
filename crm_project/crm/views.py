# crm_app/views.py
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Cars,Customer,Transaction,Leasing,Company
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .serializers import *

# ------------------------------------------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_company(request):
    # Initialize the serializer with request data
    serializer = CompanySerializer(data=request.data)
    
    if serializer.is_valid():
        # Save the company instance
        company = serializer.save()
        # Set the owner to the current user
        company.owner = request.user
        company.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_company(request):
    companies = Company.objects.filter(owner=request.user)
    serializer = CompanySerializer(companies, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_user_to_company(request):
    # Handle user invitations and create new users within the company
    # This might involve sending an email with a registration link
    pass


# ------------------------------------------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_details(request):
    if request.method == 'GET':
        user = request.user
        owner = Company.objects.filter(owner=user)
        if owner:
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            total_count = Customer.objects.count()
            customers = Customer.objects.all().order_by('-id')[(page-1)*page_size:page*page_size]

            if not customers:
                return Response({'message': 'No customers found!'}, status=status.HTTP_204_NO_CONTENT)

            serializer = CustomerSerializer(customers, many=True)

            return Response({
                    'total_count': total_count,
                    'customers': serializer.data  # key is 'customers'
                }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)




@api_view(['POST'])
@login_required
def add_customer(request):

    if request.method == 'POST':
        user = request.user
        owner = Company.objects.filter(owner=user)
        if owner:
            serializer = CustomerSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_customer(request, user_id):
    if request.method == 'PUT':
        user = request.user
        owner = Company.objects.filter(owner=user)
        if owner:
            customer = get_object_or_404(Customer, id=user_id)
            serializer = CustomerSerializer(customer, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_customer(request,user_id):
    if request.method == 'DELETE':
        user = request.user
        owner = Company.objects.filter(owner=user)
        if owner:
            customer = get_object_or_404(Customer, id=user_id)
            customer.delete()
            return Response({'message': 'Customer deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)


# ------------------------------------------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_all_cars(request):
    if request.method == 'GET':
        user = request.user
        owner = Company.objects.filter(owner=user)
        if owner:
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            total_count = Cars.objects.count()
            cars = Cars.objects.all().order_by('-id')[(page-1)*page_size:page*page_size]
            
            if not cars:
                return Response({'message': 'No cars found!'}, status=status.HTTP_204_NO_CONTENT)
            
            serializer = CarSerializer(cars, many=True)

            return Response({
                'total_count': total_count,
                'cars': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car(request):
    if request.method == 'POST':
        user = request.user
        try:
            # Fetch the company associated with the user
            company = Company.objects.get(owner=user)
        except Company.DoesNotExist:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        # Add the company_id to the request data
        request.data['company'] = company.id

        serializer = CarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'Invalid request method.'}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_car(request, car_id):
    if request.method == 'PUT':
        user = request.user
        owner = Company.objects.filter(owner=user)
        if owner:
            car = get_object_or_404(Cars, id=car_id)

            if not car:
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            serializer = CarSerializer(car, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car(request, car_id):
    if request.method == 'DELETE':
        user = request.user
        owner = Company.objects.filter(owner=user)
        if owner:
            car = get_object_or_404(Cars, id=car_id)
            car.delete()
            return Response({'message': 'Car deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)



# ------------------------------------------------------------------------------------------------------------
# transactions view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    if request.method == 'GET':
        page = int(request.GET.get('page'))
        page_size = int(request.GET.get('page_size', 10))

        total_count = Transaction.objects.count()
        transactions = Transaction.objects.all().order_by('-id')[(page-1)*page_size:page*page_size]

        if not transactions:
            return Response({'message': 'No transactions found!'}, status=status.HTTP_204_NO_CONTENT)
        
        serializer = TransactionReadSerializer(transactions, many=True)

        return Response({
            'total_count': total_count,
            'transactions': serializer.data},  # key is 'transactions'

            status=status.HTTP_200_OK)
    
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_transaction(request):
    if request.method == 'POST':
        serializer = TransactionCreateSerializer(data=request.data)
        if serializer.is_valid():
            car_id = serializer.validated_data['car'].id
            number_of_sold = 1  # each transaction represents the sale of one car

            try:
                car = Cars.objects.get(id=car_id)
                car.sold(number_of_sold)
                transaction = serializer.save()
                read_serializer = TransactionReadSerializer(transaction)
                return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
            except Cars.DoesNotExist:
                return Response({"error": "Car not found."}, status=status.HTTP_404_NOT_FOUND)
            except ValueError as ve:
                return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_transaction(request, transaction_id):
    if request.method == 'PUT':
        transaction = get_object_or_404(Transaction, id=transaction_id)
        serializer = TransactionCreateSerializer(transaction, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_transaction(request, transaction_id):
    if request.method == 'DELETE':

        transaction = get_object_or_404(Transaction, id=transaction_id)
        transaction.delete()
        return Response({'message': 'Transaction deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)



# ------------------------------------------------------------------------------------------------------------
# leas view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leasing_list(request):
    if request.method == 'GET':
        page = int(request.GET.get('page'))
        page_size = int(request.GET.get('page_size', 10))
        total_count = Leasing.objects.count()
        leases = Leasing.objects.all().order_by('-id')[(page-1)*page_size:page*page_size]

        if not leases:
            return Response({'message': 'No leases found!'}, status=status.HTTP_204_NO_CONTENT)
        
        serializer = LeasingReadSerializer(leases, many=True)
        return Response({
            'total_count': total_count,
            'leases': serializer.data},  # key is 'leases'
         status=status.HTTP_200_OK)
    
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_lease(request):
    if request.method == 'POST':
        serializer = LeasingCreateSerializer(data=request.data)
        if serializer.is_valid():
            car_id = serializer.validated_data['car'].id
            lease_number = 1

            try:
                car = Cars.objects.get(id=car_id)
                car.lease(lease_number)
                lease = serializer.save()
                read_serializer = LeasingReadSerializer(lease)
                return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
            except Cars.DoesNotExist:
                return Response({"error": "Car not found."}, status=status.HTTP_404_NOT_FOUND)
            except ValueError as ve:
                return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'Invalid request method.'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_lease(request, lease_id):

    if request.method == 'PUT':
        lease = get_object_or_404(Leasing, id=lease_id)
        serializer = LeasingCreateSerializer(lease, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_mark_as_returned(request, lease_id):
    if request.method == 'PUT':
        try:
            lease = Leasing.objects.get(id=lease_id)
            lease.mark_as_returned_from_lease = True
            lease.save()
            return Response({'message': 'Lease updated successfully'}, status=status.HTTP_200_OK)
        except Leasing.DoesNotExist:
            return Response({'error': 'Lease not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)

 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_lease(request, lease_id):

    if request.method == 'DELETE':
        lease = get_object_or_404(Leasing, id=lease_id)
        lease.delete()
        return Response({'message': 'Lease deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)





# ------------------------------------------------------------------------------------------------------------
@login_required
@api_view(['POST'])
def sold(request):
    data = request.data
    car_id = data.get('id')
    number_of_sold = data.get('number_of_sold')

    # Validate the number_of_sold
    if number_of_sold is None or not isinstance(number_of_sold, int) or number_of_sold <= 0:
        return JsonResponse({"error": "Invalid number_of_sold value. Must be a positive integer."}, safe=False, status=400)

    try:
        car = Cars.objects.get(id=car_id)
        car.sold(number_of_sold)
        return JsonResponse({"message": "Car sold successfully."}, safe=False)
    except Cars.DoesNotExist:
        return JsonResponse({"error": "Car not found."}, safe=False, status=404)
    except ValueError as ve:
        return JsonResponse({"error": str(ve)}, safe=False, status=400)

@login_required
@api_view(['POST'])
def lease(request):
    data = request.data
    car_id = data.get('id')
    number_of_lease = data.get('number_of_lease')

    # Validate the number_of_lease
    if number_of_lease is None or not isinstance(number_of_lease, int) or number_of_lease <= 0:
        return JsonResponse({"error": "Invalid number_of_lease value. Must be a positive integer."}, safe=False, status=400)

    try:
        car = Cars.objects.get(id=car_id)
        car.lease(number_of_lease)
        return JsonResponse({"message": "Car leased successfully."}, safe=False)
    except Cars.DoesNotExist:
        return JsonResponse({"error": "Car not found."}, safe=False, status=404)
    except ValueError as ve:
        return JsonResponse({"error": str(ve)}, safe=False, status=400)