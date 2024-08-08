import React, { useState } from 'react';
import styles from '../styles/ModalAddCar.module.css';  // Adjust the path as needed
import axios from 'axios';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newCar: any) => void;
  }
  
  const ModalAddCar: React.FC<ModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState<number | string>('');  // Allow both number and string
    const [color, setColor] = useState('');
    const [engine, setEngine] = useState('');
    const [moreInfo, setMoreInfo] = useState('');
    const [totalAvailableNumber, setTotalAvailableNumber] = useState<number | string>('');  // Allow both number and string
    const [numberOfCarsInLease, setNumberOfCarsInLease] = useState<number | string>('');  // Allow both number and string
    const [isStillInStock, setIsStillInStock] = useState(false);
    const [error, setError] = useState('');
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const newCar = {
        brand,
        model,
        year: Number(year),  // Ensure year is a number
        color,
        engine,
        more_info: moreInfo,
        total_available_number: Number(totalAvailableNumber),  // Ensure totalAvailableNumber is a number
        number_of_cars_in_lease: Number(numberOfCarsInLease),  // Ensure numberOfCarsInLease is a number
        is_still_in_stock: isStillInStock
      };
      try {
        const response = await axios.post('http://localhost:8000/crm/api/add_car/', newCar, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        });
        onAdd(response.data); // Use response data to update the parent component
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
          <h2>Add Car</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>Brand:</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            <label>Model:</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
            <label>Year:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
            <label>Color:</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
            <label>Engine:</label>
            <input
              type="text"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              required
            />
            <label>More Info:</label>
            <textarea
              value={moreInfo}
              onChange={(e) => setMoreInfo(e.target.value)}
              required
            />
            <label>Total Available Number:</label>
            <input
              type="number"
              value={totalAvailableNumber}
              onChange={(e) => setTotalAvailableNumber(e.target.value)}
              required
            />
            <label>Number of Cars in Lease:</label>
            <input
              type="number"
              value={numberOfCarsInLease}
              onChange={(e) => setNumberOfCarsInLease(e.target.value)}
              required
            />
            <label>Is Still in Stock:</label>
            <input
              type="checkbox"
              checked={isStillInStock}
              onChange={(e) => setIsStillInStock(e.target.checked)}
            />
            <button type="submit">Add</button>
          </form>
        </div>
      </div>
    );
  };
  
export default ModalAddCar;