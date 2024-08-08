import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ModalUpdateLease.module.css';

interface ModalUpdateLeaseProps {
  isOpen: boolean;
  onClose: () => void;
  lease: Lease;
  onEdit: (updatedLease: Lease) => void;
}

interface Lease {
  id: number;
  customer: {
    id: number;
    name: string;
  };
  car: {
    id: number;
    model: string;
    brand: string;
    year: number;
  };
  amount: string;
  lease_start_date: string;
  lease_end_date: string;
  mark_as_returned_from_lease: boolean;
}

export default function ModalUpdateLease({ isOpen, onClose, lease, onEdit }: ModalUpdateLeaseProps) {
  const [customer, setCustomer] = useState<number | ''>(lease.customer.id);
  const [car, setCar] = useState<number | ''>(lease.car.id);
  const [amount, setAmount] = useState(lease.amount);
  const [leaseStartDate, setLeaseStartDate] = useState(lease.lease_start_date);
  const [leaseEndDate, setLeaseEndDate] = useState(lease.lease_end_date);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, carsResponse] = await Promise.all([
          axios.get('http://localhost:8000/crm/api/customers/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get('http://localhost:8000/crm/api/cars/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        setCustomers(customersResponse.data.customers);
        setCars(carsResponse.data.cars);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching customers or cars');
        setLoading(false);
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

    const updatedLease = { 
      id: lease.id,
      customer: Number(customer),
      car: Number(car),
      amount,
      lease_start_date: leaseStartDate,
      lease_end_date: leaseEndDate,
      mark_as_returned_from_lease: false,
    };

    try {
      const response = await axios.put(`http://localhost:8000/crm/api/update_lease/${lease.id}/`, updatedLease, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      onEdit(response.data);
      onClose();
    } catch (err) {
      console.error('Error updating lease:', err);
      setError('Error updating lease');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edit Lease</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="customer">Customer</label>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <select id="customer" value={customer} onChange={(e) => setCustomer(Number(e.target.value))}>
                {Array.isArray(customers) && customers.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="car">Car</label>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <select id="car" value={car} onChange={(e) => setCar(Number(e.target.value))}>
                {Array.isArray(cars) && cars.map((car: any) => (
                  <option key={car.id} value={car.id}>{car.brand} {car.model} ({car.year})</option>
                ))}
              </select>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="leaseStartDate">Lease Start Date</label>
            <input
              type="date"
              id="leaseStartDate"
              value={leaseStartDate}
              onChange={(e) => setLeaseStartDate(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="leaseEndDate">Lease End Date</label>
            <input
              type="date"
              id="leaseEndDate"
              value={leaseEndDate}
              onChange={(e) => setLeaseEndDate(e.target.value)}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formActions}>
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
