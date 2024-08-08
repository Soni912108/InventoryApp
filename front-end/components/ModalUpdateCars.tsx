import React, { useState, useEffect } from 'react';
import styles from '../styles/ModalAddCar.module.css';  // Adjust the path as needed
import axios from 'axios';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: any; // Define a more specific type if available
  onUpdate: (updatedData: any) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, car, onUpdate }) => {
  const [brand, setBrand] = useState(car.brand || '');
  const [model, setModel] = useState(car.model || '');
  const [year, setYear] = useState(car.year || '');
  const [color, setColor] = useState(car.color || '');
  const [engine, setEngine] = useState(car.engine || '');
  const [more_info, setMoreInfo] = useState(car.more_info || '');
  const [total_available_number, setTotalAvailableNumber] = useState(car.total_available_number || '');
  const [number_of_cars_in_lease, setNumberOfCarsInLease] = useState(car.number_of_cars_in_lease || '');
  const [is_still_in_stock, setIsStillInStock] = useState(car.is_still_in_stock || false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (car) {
      setBrand(car.brand);
      setModel(car.model);
      setYear(car.year);
      setColor(car.color);
      setEngine(car.engine);
      setMoreInfo(car.more_info);
      setTotalAvailableNumber(car.total_available_number);
      setNumberOfCarsInLease(car.number_of_cars_in_lease);
      setIsStillInStock(car.is_still_in_stock);
    }
  }, [car]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      brand,
      model,
      year,
      color,
      engine,
      more_info,
      total_available_number,
      number_of_cars_in_lease,
      is_still_in_stock
    };
    try {
      const response = await axios.put(`http://localhost:8000/crm/api/update_car/${car.id}/`, updatedData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      onUpdate(response.data); // Use response data to update the parent component
      onClose();
    } catch (err) {
      setError('Error updating car');
      console.error('Error updating car', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>&times;</span>
        <h2>Update Car</h2>
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
            onChange={(e) => setYear(Number(e.target.value))}
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
            value={more_info}
            onChange={(e) => setMoreInfo(e.target.value)}
            required
          />
          <label>Total Available Number:</label>
          <input
            type="number"
            value={total_available_number}
            onChange={(e) => setTotalAvailableNumber(Number(e.target.value))}
            required
          />
          <label>Number of Cars in Lease:</label>
          <input
            type="number"
            value={number_of_cars_in_lease}
            onChange={(e) => setNumberOfCarsInLease(Number(e.target.value))}
            required
          />
          <label>Is Still in Stock:</label>
          <input
            type="checkbox"
            checked={is_still_in_stock}
            onChange={(e) => setIsStillInStock(e.target.checked)}
          />
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
