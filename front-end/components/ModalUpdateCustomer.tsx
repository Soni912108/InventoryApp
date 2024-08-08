import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/ModalUpdateCustomer.module.css'; // Reuse CSS module

interface ModalUpdateCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone_number: number;
  address: string;
}

export default function ModalUpdateCustomer({ isOpen, onClose, customer, onUpdate }: ModalUpdateCustomerProps) {
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone_number, setPhoneNumber] = useState(customer.phone_number.toString());
  const [address, setAddress] = useState(customer.address);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCustomer: Customer = { 
      ...customer,
      name,
      email,
      phone_number: parseInt(phone_number), // Parse phone number to ensure it's a number
      address,
    };

    try {
      const response = await axios.put(`http://localhost:8000/crm/api/update_customer/${customer.id}/`, updatedCustomer, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      onUpdate(response.data);
      onClose();
    } catch (err) {
      setError('Error updating customer');
      console.error('Error updating customer', err);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Edit Customer</h2>
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
              type="number"
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
            <button type="submit" className={styles.addButton}>Update Customer</button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
