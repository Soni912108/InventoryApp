// pages/leases.tsx
"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/LeasesPage.module.css';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import ModalAddLease from '../../components/ModalAddLease';
import ModalUpdateLease from '../../components/ModalUpdateLease';
import {SearchInput} from '../../components/SearchInput';
import SelectRows from '../../components/SelectRows';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';

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
  lease_start_date: string;
  lease_end_date: string;
  amount: string;
  mark_as_returned_from_lease: boolean;
  selected?: boolean;
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isAddLeaseModalOpen, setIsAddLeaseModalOpen] = useState(false);
  const [isEditLeaseModalOpen, setIsEditLeaseModalOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [noLeasesFound, setNoLeasesFound] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedLeases, setSelectedLeases] = useState<Lease[]>([]);
  const [totalLeases, setTotalLeases] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const token = localStorage.getItem('token');
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setLoading(true);
    router.push(path);
    setLoading(false);
  };

  const fetchLeases = async () => {
    if (!token) {
      setError('You are not authenticated. Please log in.');
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/crm/api/leases/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          page_size: rowsPerPage,
        },
      });

      setLeases(response.data.leases);
      setFilteredLeases(response.data.leases);
      setTotalLeases(response.data.total_count);
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setNoLeasesFound(false);
          router.push('/login');
        } else if (err.response?.status === 204 && err.response?.data.message === 'No lease found!') {
          setNoLeasesFound(true);
        } else {
          console.error('Error fetching lease:', err);
        }
      } else {
        console.error('Error fetching lease:', err);
      }
      console.error('Error fetching leases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, [currentPage, rowsPerPage]);

  const handleAddLease = (newLease: Lease) => {
    setLeases([...leases, newLease]);
    setFilteredLeases([...leases, newLease]);
  };

  const handleEditLease = (updatedLease: Lease) => {
    setLeases(leases.map((lease) =>
      lease.id === updatedLease.id ? updatedLease : lease
    ));
    setFilteredLeases(leases.map((lease) =>
      lease.id === updatedLease.id ? updatedLease : lease
    ));
  };

  const handleDeleteLease = async (leaseId: number) => {
    if (!confirm('Are you sure you want to delete this lease?')) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/crm/api/delete_lease/${leaseId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeases(leases.filter((lease) => lease.id !== leaseId));
      setFilteredLeases(leases.filter((lease) => lease.id !== leaseId));
      setLoading(false);
    } catch (err) {
      console.error('Error deleting lease', err);
    }
  };

  const handleDeleteSelectedLeases = async () => {
    if (!confirm('Are you sure you want to delete the selected leases?')) return;
    setLoading(true);
    try {
      for (const lease of selectedLeases) {
        await axios.delete(`http://localhost:8000/crm/api/delete_lease/${lease.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setLeases(leases.filter((lease) => !selectedLeases.includes(lease)));
      setFilteredLeases(leases.filter((lease) => !selectedLeases.includes(lease)));
      setSelectedLeases([]);
      setIsSelectionMode(false);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting leases', err);
    }
  };

  const openEditModal = (lease: Lease) => {
    setSelectedLease(lease);
    setIsEditLeaseModalOpen(true);
  };

  const handleSearch = (searchTerm: string) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    setLoading(true);
    setFilteredLeases(
      leases.filter(lease =>
        lease.customer.name.toLowerCase().includes(lowercasedSearchTerm) ||
        lease.car.model.toLowerCase().includes(lowercasedSearchTerm) ||
        lease.car.brand.toLowerCase().includes(lowercasedSearchTerm) ||
        lease.car.year.toString().includes(lowercasedSearchTerm) ||
        lease.amount.toLowerCase().includes(lowercasedSearchTerm) ||
        new Date(lease.lease_start_date).toLocaleDateString().includes(lowercasedSearchTerm) ||
        new Date(lease.lease_end_date).toLocaleDateString().includes(lowercasedSearchTerm)
      )
    );
    setLoading(false);
    setCurrentPage(1);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedLeases([]);
    }
  };

  const handleSelectLease = (leaseId: number) => {
    const updatedLeases = leases.map(lease =>
      lease.id === leaseId
        ? { ...lease, selected: !lease.selected }
        : lease
    );

    setLeases(updatedLeases);
    setFilteredLeases(updatedLeases);

    const updatedSelectedLeases = updatedLeases.filter(lease => lease.selected);
    setSelectedLeases(updatedSelectedLeases);
  };

  const handleMarkAsReturned = async (leaseId: number) => {
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      await axios.put(`http://localhost:8000/crm/api/update_mark_as_returned/${leaseId}/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeases(leases.map(lease =>
        lease.id === leaseId ? { ...lease, mark_as_returned_from_lease: true } : lease
      ));
      setFilteredLeases(leases.map(lease =>
        lease.id === leaseId ? { ...lease, mark_as_returned_from_lease: true } : lease
      ));
    } catch (err) {
      console.error('Error updating lease:', err);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar handleNavigation={handleNavigation} />
      <h1 className={styles.title}>Leases</h1>
      <div className={styles.actionsContainer}>
        <SelectRows
          isSelectionMode={isSelectionMode}
          toggleSelectionMode={toggleSelectionMode}
          handleDeleteSelectedItems={handleDeleteSelectedLeases}
          selectedItemsCount={selectedLeases.length}
          items={leases} // Pass the 'leases' array as the 'items' prop
        />
      </div>
      <div className={styles.leftAlignedContainer}>
        <SearchInput onSearch={handleSearch} />
      </div>
      <button
        className={styles.addLeaseButton}
        onClick={() => setIsAddLeaseModalOpen(true)}
      >
        Add Lease
      </button>
      {loading && <Spinner />}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {info && <p style={{ color: 'gray', textAlign: 'center' }}>{info}</p>}
      {noLeasesFound && !error && !info && <p style={{ color: 'gray', textAlign: 'center' }}>No leases found.</p>}
      {!noLeasesFound && !loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              {isSelectionMode && <th>Select</th>}
              <th>Lease Id</th>
              <th>Customer</th>
              <th>Car</th>
              <th>Amount</th>
              <th>Lease Start Date</th>
              <th>Lease End Date</th>
              <th>Mark as Returned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeases.map((lease) => (
              <tr key={lease.id}>
                {isSelectionMode && (
                  <td>
                    <input
                      type="checkbox"
                      checked={lease.selected || false}
                      onChange={() => handleSelectLease(lease.id)}
                    /></td>
                )}
                <td>{lease.id}</td>
                <td>{lease.customer.name}</td>
                <td>
                  {lease.car.brand} {lease.car.model} ({lease.car.year})
                </td>
                <td>${parseFloat(lease.amount).toFixed(2)}</td>
                <td>{new Date(lease.lease_start_date).toLocaleDateString()}</td>
                <td>{new Date(lease.lease_end_date).toLocaleDateString()}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={lease.mark_as_returned_from_lease}
                    disabled={lease.mark_as_returned_from_lease}
                    onChange={() => handleMarkAsReturned(lease.id)}
                  /></td>
                <td>
                  <button onClick={() => openEditModal(lease)} className={`${styles.button} ${styles.edit}`} >Edit</button>
                  <button
                    className={`${styles.button} ${styles.delete}`}
                    style={{ marginLeft: '10px' }}
                    onClick={() => handleDeleteLease(lease.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination
        currentPage={currentPage}
        totalItems={totalLeases}
        itemsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
      />
      <ModalAddLease
        isOpen={isAddLeaseModalOpen}
        onClose={() => setIsAddLeaseModalOpen(false)}
        onAdd={handleAddLease} // Ensure handleAddLease has the correct type
      />
      {selectedLease && (
        <ModalUpdateLease
          isOpen={isEditLeaseModalOpen}
          onClose={() => setIsEditLeaseModalOpen(false)}
          lease={selectedLease}
          onEdit={handleEditLease}
        />
      )}
    </div>
  );
}
