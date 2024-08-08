"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/CarPage.module.css';
import Modal from '../../components/ModalUpdateCars';
import ModalAddCar from '../../components/ModalAddCar';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { SearchInput } from '../../components/SearchInput';
import SelectRows from '../../components/SelectRows';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner'; // Import the spinner component

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  engine: string;
  more_info: string;
  total_available_number: number;
  sold_cars: number;
  number_of_cars_in_lease: number;
  is_still_in_stock: boolean;
  selected?: boolean;
}

export default function CarsPage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [filteredCars, setFilteredCars] = useState<Car[]>([]);
    const [totalCars, setTotalCars] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
    const [selectedCars, setSelectedCars] = useState<Car[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page
    const token = localStorage.getItem('token');
    const router = useRouter();

    const handleNavigation = (path: string) => {
      setLoading(true);
      router.push(path);
      setLoading(false);
    };

    const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      if (isSelectionMode) {
        setSelectedCars([]);
      }
    };

    const fetchCars = async () => {
      if (!token) {
        setError('You are not authenticated. Please log in.');
        router.push('/login');
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/crm/api/cars/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            page_size: rowsPerPage,
          },
        });
    
        setCars(response.data.cars);
        setFilteredCars(response.data.cars); // Ensure filteredCars is set
        setTotalCars(response.data.total_count); // Ensure this is correctly set
        setLoading(false);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError('You are not authenticated. Please log in.');
            router.push('/login');
          } else if (err.response?.status === 404 && err.response?.data.message === 'No cars found!') {
            setInfo('No cars found.');
          } else {
            console.error('Error fetching cars:', err);
          }
        } else {
          console.error('Error fetching cars:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
      fetchCars();
    }, [currentPage, rowsPerPage]);
    
    
    const handleEdit = (car: Car) => {
      setSelectedCar(car);
      setModalOpen(true);
    };
    
    const handleCloseModal = () => {
      setModalOpen(false);
      setSelectedCar(null);
    };
    
    const handleUpdateCar = (updatedCar: Car) => {
      setCars((prevCars) =>
        prevCars.map((car) =>
          car.id === updatedCar.id ? updatedCar : car
        )
      );
      setFilteredCars((prevCars) =>
        prevCars.map((car) =>
          car.id === updatedCar.id ? updatedCar : car
        )
      );
    };
    
    const handleSelectCars = (carId: number) => {
      const updatedCar = cars.map(car =>
        car.id === carId
          ? { ...car, selected: !car.selected }
          : car
      );
      setCars(updatedCar);
      setFilteredCars(updatedCar);
    
      const updatedSelectedCars = updatedCar.filter(car => car.selected);
      setSelectedCars(updatedSelectedCars);
    };
    
    const handleDelete = async (id: number) => {

      if (!confirm('Are you sure you want to delete this car?')) return;
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8000/crm/api/delete_car/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setCars(cars.filter(car => car.id !== id));
        setFilteredCars(cars.filter(car => car.id !== id));
        setLoading(false);
      } catch (err) {
        console.error('Error deleting car:', err);
      }
    };
    
    const handleAddCar = (newCar: Car) => {
      setCars([...cars, newCar]);
      setFilteredCars([...cars, newCar]);
    };
    
    const handleDeleteSelectedCars = async () => {
      
      if (!confirm('Are you sure you want to delete the selected cars?')) return;
      setLoading(true);
      try {
        for (const car of selectedCars) {
          await axios.delete(`http://localhost:8000/crm/api/delete_car/${car.id}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
        setCars(cars.filter((car) => !selectedCars.includes(car)));
        setFilteredCars(cars.filter((car) => !selectedCars.includes(car)));
        setSelectedCars([]);
        setIsSelectionMode(false);
        setLoading(false);
      } catch (err) {
        console.error('Error deleting cars', err);
      }
    };
    
    const handleSearch = (searchTerm: string) => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      setFilteredCars(
        cars.filter(car =>
          car.brand.toLowerCase().includes(lowercasedSearchTerm) ||
          car.model.toLowerCase().includes(lowercasedSearchTerm) ||
          car.year.toString().includes(lowercasedSearchTerm) ||
          car.color.toLowerCase().includes(lowercasedSearchTerm) ||
          car.engine.toLowerCase().includes(lowercasedSearchTerm) ||
          car.more_info.toLowerCase().includes(lowercasedSearchTerm)
        )
      );
      setCurrentPage(1);
    };
    
    return (
      <div className={styles.container}>
        <title>Cars</title>
        {loading && <Spinner />} {/* Show the spinner when loading */}
        <Navbar handleNavigation={handleNavigation} />
        <h1 className={styles.title}>Car List</h1>
        <div className={styles.actionsContainer}>
          <SelectRows
            isSelectionMode={isSelectionMode}
            toggleSelectionMode={toggleSelectionMode}
            handleDeleteSelectedItems ={handleDeleteSelectedCars}
            selectedItemsCount={selectedCars.length}
            items={cars} // Pass the 'cars' array as the 'items' prop
          />
        </div>
        <div className={styles.leftAlignedContainer}>
          <SearchInput onSearch={handleSearch} />
        </div>
        <button
          className={styles.addCarButton}
          onClick={() => setIsAddCarModalOpen(true)}
        >
          Add Car
        </button>
        <ModalAddCar
          isOpen={isAddCarModalOpen}
          onClose={() => setIsAddCarModalOpen(false)}
          onAdd={handleAddCar}
        />
        <table className={styles.table}>
            <thead>
              <tr>
                <th>Car Id</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Year</th>
                <th>Color</th>
                <th>Engine</th>
                <th>More Info</th>
                <th>Available Number</th>
                <th>Leased Number</th>
                <th>Sold Number</th>
                <th>In Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(cars) && cars.length > 0 ? (
                cars.map((car) => (
                    <tr key={car.id} className={styles.tableRow}>
                      {isSelectionMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={car.selected || false}
                        onChange={() => handleSelectCars(car.id)}
                      />
                    </td>
                  )}
                    <td>{car.id}</td>
                    <td>{car.brand}</td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                    <td>{car.color}</td>
                    <td>{car.engine}</td>
                    <td>{car.more_info}</td>
                    <td>{car.total_available_number}</td>
                    <td>{car.number_of_cars_in_lease}</td>
                    <td>{car.sold_cars}</td>
                    <td>{car.is_still_in_stock ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(car)}
                        className={`${styles.button} ${styles.edit}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
                        className={`${styles.button} ${styles.delete}`}
                        style={{ marginLeft: '10px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center' }}>
                    No cars available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        <Pagination
            currentPage={currentPage}
            totalItems={totalCars}
            itemsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
          />
        {selectedCar && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            car={selectedCar}
            onUpdate={handleUpdateCar}
          />
        )}
      </div>
    );
}    