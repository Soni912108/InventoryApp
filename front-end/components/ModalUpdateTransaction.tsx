import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ModalUpdateTransaction.module.css';

interface ModalEditTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onEdit: (updatedTransaction: Transaction) => void;
}

interface Transaction {
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
  date: string;
  receipt: string;
}

export default function ModalEditTransaction({ isOpen, onClose, transaction, onEdit }: ModalEditTransactionProps) {
  const [customer, setCustomer] = useState<number | ''>(transaction.customer.id);
  const [car, setCar] = useState<number | ''>(transaction.car.id);
  const [amount, setAmount] = useState(transaction.amount);
  const [date, setDate] = useState(transaction.date);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, carsResponse] = await Promise.all([
          axios.get('http://localhost:8000/crm/api/customers/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get('http://localhost:8000/crm/api/cars/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        setCustomers(customersResponse.data.customers);
        setCars(carsResponse.data.cars);
      } catch (err) {
        setError('Error fetching customers or cars');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTransaction = { 
      id: transaction.id,
      customer: Number(customer),
      car: Number(car),
      amount,
      date,
    };

    try {
      const response = await axios.put(`http://localhost:8000/crm/api/update_transaction/${transaction.id}/`, updatedTransaction, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      onEdit(response.data);
      onClose();
    } catch (err) {
      setError('Error updating transaction');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edit Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="customer">Customer</label>
            <select id="customer" value={customer} onChange={(e) => setCustomer(Number(e.target.value))}>
              {customers.map((cust: any) => (
                <option key={cust.id} value={cust.id}>{cust.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="car">Car</label>
            <select id="car" value={car} onChange={(e) => setCar(Number(e.target.value))}>
              {cars.map((c: any) => (
                <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount</label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
