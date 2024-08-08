import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/ModalAddCustomer.module.css'; // Import CSS module

interface ModalAddCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCustomer: Customer) => void;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
}

export default function ModalAddCustomer({ isOpen, onClose, onAdd }: ModalAddCustomerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Omit<Customer, 'id'> = { 
      name, 
      email, 
      phone_number,
      address,
    };

    try {
      const response = await axios.post('http://localhost:8000/crm/api/add_customer/', newCustomer, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      onAdd(response.data);
      onClose();
    } catch (err) {
      setError('Error adding customer');
      console.error('Error adding customer', err);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Add New Customer</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.modalFormLabel}>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.modalFormInput}
            />
          </label>
          <label className={styles.modalFormLabel}>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.modalFormInput}
            />
          </label>
          <label className={styles.modalFormLabel}>
            Phone Number:
            <input
              type="text" // Changed to text to accommodate non-numeric characters
              value={phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className={styles.modalFormInput}
            />
          </label>
          <label className={styles.modalFormLabel}>
            Address:
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className={styles.modalFormInput}
            />
          </label>
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addButton}>Add Customer</button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
