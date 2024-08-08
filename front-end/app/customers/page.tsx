"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ModalAddCustomer from '../../components/ModalAddCustomer';
import ModalUpdateCustomer from '../../components/ModalUpdateCustomer';
import styles from '../../styles/Customers.module.css';
import { useRouter } from 'next/navigation';

import Navbar from '../../components/Navbar';
import { SearchInput } from '../../components/SearchInput';
import SelectRows from '../../components/SelectRows';
import Pagination from '../../components/Pagination';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  selected?: boolean;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [noCustomersFound, setNoCustomersFound] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const token = localStorage.getItem('token');
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page

    const router = useRouter();
  
    const handleNavigation = (path: string) => {
      setLoading(true); // Show the spinner
      router.push(path);
    };

    const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      if (isSelectionMode) {
        setSelectedCustomers([]);
      }
    }

    const fetchCustomers = async () => {
      if (!token) {
        setNoCustomersFound(false);
        router.push('/login');
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:8000/crm/api/customers/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            page_size: rowsPerPage,
          },
        });
        setCustomers(response.data.customers);
        setFilteredCustomers(response.data.customers);
        setTotalCustomers(response.data.total_count);
  
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setNoCustomersFound(false);
            router.push('/login');
          } else if (err.response?.status === 204 && err.response?.data.message === 'No customers found!') {
            setNoCustomersFound(true);
          } else {
            setError('Error fetching customers');
          }
        } else {
          setError('Error fetching customers');
        }
        console.error('Error fetching customers', err);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchCustomers();
    }, [currentPage, rowsPerPage]);


  const handleUpdateCustomer = (updatedData: Customer) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === updatedData.id ? updatedData : customer
    );
    setCustomers(updatedCustomers);
    setFilteredCustomers(updatedCustomers);
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers([...customers, newCustomer]);
    setFilteredCustomers([...customers, newCustomer]);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = async (id: number) => {

    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`http://localhost:8000/crm/api/delete_customer/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedCustomers = customers.filter((customer) => customer.id !== id);
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
    } catch (err) {
      setError('Error deleting customer');
      console.error('Error deleting customer', err);
    }
  };

  const handleSearch = (searchTerm: string) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    setFilteredCustomers(
      customers.filter(customer =>
        customer.name.toLowerCase().includes(lowercasedSearchTerm) ||
        customer.email.toLowerCase().includes(lowercasedSearchTerm) ||
        customer.phone_number.toString().toLowerCase().includes(lowercasedSearchTerm) || // Convert phone_number to string
        customer.address.toLowerCase().includes(lowercasedSearchTerm)
      )
    );
    setCurrentPage(1);
  };

  const handleSelectCustomers= (customerId: number) => {
    const updatedCustomer = customers.map(customer =>
      customer.id === customerId
        ? { ...customer, selected: !customer.selected }
        : customer
    );
    setCustomers(updatedCustomer);
    setFilteredCustomers(updatedCustomer);

    const updatedSelectedCustomers = updatedCustomer.filter(customer => customer.selected);
    setSelectedCustomers(updatedSelectedCustomers);
  };

  const handleDeleteSelectedCustomers= async () => {

    if (!confirm('Are you sure you want to delete the selected customers?')) return;
    try {
      for (const customer of selectedCustomers) {
        await axios.delete(`http://localhost:8000/crm/api/delete_customer/${customer.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setCustomers(customers.filter((customer) => !selectedCustomers.includes(customer)));
      setFilteredCustomers(customers.filter((customer) => !selectedCustomers.includes(customer)));
      setSelectedCustomers([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error('Error deleting customers', err);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={styles.container}>
      <title>Customers</title>
      <Navbar handleNavigation={handleNavigation} />

      <h2 className={styles.title}>Customer List</h2>

      <div className={styles.actionsContainer}>
        <SelectRows
          isSelectionMode={isSelectionMode}
          toggleSelectionMode={toggleSelectionMode}
          handleDeleteSelectedItems ={handleDeleteSelectedCustomers}
          selectedItemsCount={selectedCustomers.length}
          items={customers} // Pass the 'customers' array as the 'items' prop
        />
        </div>
        <div className={styles.leftAlignedContainer}>
          <SearchInput onSearch={handleSearch} />
        </div>

      <button
        className={styles.addButton}
        onClick={() => setAddModalOpen(true)}
      >
        Add Customer
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {info && <p style={{ color: 'gray', textAlign: 'center' }}>{info}</p>}
      {noCustomersFound && !error && !info && <p style={{ color: 'gray', textAlign: 'center' }}>No Customers found.</p>}
      {!noCustomersFound && !loading && !error && (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Customer Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredCustomers) && filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              
              <tr key={customer.id}>
                
                {isSelectionMode && (
                  <td>
                    <input
                      type="checkbox"
                      checked={customer.selected || false}
                      onChange={() => handleSelectCustomers(customer.id)}
                    />
                  </td>
                )}
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone_number}</td>
                <td>{customer.address}</td>
                <td>
                  <button
                    onClick={() => handleEdit(customer)}
                    className={`${styles.button} ${styles.edit}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
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
              <td colSpan={6} style={{ textAlign: 'center' }}>No customers available</td>
            </tr>
          )}
        </tbody>
      </table>
      )}
      <Pagination
        currentPage={currentPage}
        totalItems={totalCustomers}
        itemsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
      />
      {isAddModalOpen && (
        <ModalAddCustomer
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onAdd={handleAddCustomer}
        />
      )}

      {isEditModalOpen && selectedCustomer && (
        <ModalUpdateCustomer
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          customer={selectedCustomer}
          onUpdate={handleUpdateCustomer}
        />
      )}
    </div>
  );
}
