import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ModalAddLease.module.css';

interface ModalAddLeaseProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newLease: Lease) => void;
}

interface Lease {
  customer: number;
  car: number;
  lease_start_date: string;
  lease_end_date: string;
}

interface Customer {
  id: number;
  name: string;
}

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  engine: string;
  color: string;
}

export default function ModalAddLease({ isOpen, onClose, onAdd }: ModalAddLeaseProps) {
  const [customer, setCustomer] = useState<number | ''>('');
  const [car, setCar] = useState<number | ''>('');
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, carsResponse] = await Promise.all([
          axios.get('http://localhost:8000/crm/api/customers/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get('http://localhost:8000/crm/api/cars/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ]);

        setCustomers(Array.isArray(customersResponse.data.customers) ? customersResponse.data.customers : []);
        setCars(Array.isArray(carsResponse.data.cars) ? carsResponse.data.cars : []);
      } catch (err) {
        setError('Error fetching customers or cars');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(leaseEndDate) < new Date(leaseStartDate)) {
      setError('End date cannot be before start date');
      return;
    }
    const newLease: Lease = {
      customer: Number(customer),
      car: Number(car),
      lease_start_date: leaseStartDate,
      lease_end_date: leaseEndDate,
    };

    try {
      const response = await axios.post('http://localhost:8000/crm/api/add_lease/', newLease, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      console.log('Response data:', response.data);
      onAdd(response.data);
      onClose();
    } catch (err) {
      setError('Error adding lease');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add New Lease</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Customer:
            <select value={customer} onChange={(e) => setCustomer(Number(e.target.value))} required>
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label>
            Car:
            <select value={car} onChange={(e) => setCar(Number(e.target.value))} required>
              <option value="">Select Car</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {`${car.brand} ${car.model} (${car.year}) - Engine: ${car.engine}, Color: ${car.color}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lease Start Date:
            <input type="date" value={leaseStartDate} onChange={(e) => setLeaseStartDate(e.target.value)} required />
          </label>
          <label>
            Lease End Date:
            <input type="date" value={leaseEndDate} onChange={(e) => setLeaseEndDate(e.target.value)} required />
          </label>
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addButton}>Add Lease</button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
