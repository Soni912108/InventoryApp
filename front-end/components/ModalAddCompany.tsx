
import axios from 'axios';
import styles from '../styles/AddCompany.module.css'; // Import the modal styles
import React, { useState } from 'react';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCompany: any) => void;
}

const ModalAddCompany: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newCompany = {
            name,
            address
        };
        try {
          const response = await axios.post('http://localhost:8000/crm/api/create_company/', newCompany, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
          });
          console.log(response.data)
          onClose();
        } catch (err) {
          setError('Error adding car');
          console.error('Error adding car', err);
        }
      };


  if (!isOpen) return null;

  return (
  <div className={styles.modal}>
  <div className={styles.modalContent}>
    <span className={styles.close} onClick={onClose}>&times;</span>
    <h2>Add Company</h2>
    {error && <p style={{ color: 'red' }}>{error}</p>}
    <form onSubmit={handleSubmit}>
        <label>Brand:</label>
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
        />
        <label>Address:</label>
        <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
        />
      <button type="submit">Add</button>
    </form>
  </div>
</div>
);
};

export default ModalAddCompany;
