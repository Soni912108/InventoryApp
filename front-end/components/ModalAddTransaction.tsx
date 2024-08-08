import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ModalAddTransaction.module.css';

interface ModalAddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newTransaction: Transaction) => void;
}

interface Transaction {
  id: number;
  customer: {
    id: number;
    name: string;
  };
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
  };
  amount: string;
  receipt: string;
  date: string;
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

export default function ModalAddTransaction({ isOpen, onClose, onAdd }: ModalAddTransactionProps) {
  const [customer, setCustomer] = useState<number | ''>('');
  const [car, setCar] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
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

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    const newTransaction: Transaction = {
      id: 0, // This field will be updated by the server
      customer: {
        id: Number(customer),
        name: '', // This will be updated after fetching or handled by the server
      },
      car: {
        id: Number(car),
        brand: '', // This will be updated after fetching or handled by the server
        model: '', // This will be updated after fetching or handled by the server
        year: new Date().getFullYear(), // Example default value, adjust as needed
      },
      amount,
      receipt: '', // This field will be updated by the server
      date,
    };

    try {
      const response = await axios.post('http://localhost:8000/crm/api/add_transaction/', newTransaction, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      console.log('Response data:', response.data);
      onAdd(response.data);
      onClose();
    } catch (err) {
      setError('Error adding transaction');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add New Transaction</h2>
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
            Amount:
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addButton}>Add Transaction</button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
