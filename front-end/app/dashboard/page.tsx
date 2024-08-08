"use client";

import { useRouter } from 'next/navigation';
import styles from '../../styles/Dashboard.module.css';
import React, { useState, useEffect } from 'react';
import { FaUser, FaCar, FaMoneyCheckAlt, FaFileContract, FaBars, FaTimes } from 'react-icons/fa';
import Spinner from '../../components/Spinner'; // Import the spinner component
import ModalAddCompany from '../../components/ModalAddCompany'; // Import the modal component

export default function Dashboard() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar state
  const [modalOpen, setModalOpen] = useState(true); // Modal state
  const router = useRouter();
  const username = localStorage.getItem('username');
  const [companies, setCompanies] = useState<any[]>([]); // Add a state for companies

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('You are not authenticated. Please log in.');
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  useEffect(() => {
    // Simulate an API call or check here if needed to determine if modal should be shown
    setModalOpen(true); // Ensure modal is open initially
  }, []);

  const handleNavigation = async (path: string) => {
    setLoading(true); // Show the spinner
    setTimeout(() => {
      router.push(path);
      setLoading(false); // Hide the spinner after navigation
    }, 500); // Add delay to simulate loading
  };

  const handleLogout = () => {
    localStorage.clear();
    setError('');
    setLoading(true); // Show the spinner
    setTimeout(() => {
      router.push('/login');
      setLoading(false); // Hide the spinner after navigation
    }, 500); // Add delay to simulate loading
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Define the onAdd function
  const handleAddCompany = (newCompany: any) => {
    setCompanies([...companies, newCompany]);
  };

  if (!token) {
    return null; // Return null while checking authentication
  }

  return (
    <div className={styles.dashboardBody}>
      <div className={styles.dashboardContainer}>
        {loading && <Spinner />} {/* Show the spinner when loading */}
        <title>CRM-Dashboard</title>
        <div className={styles.navbar}>
          <div className={styles.userGreeting}>Hello, {username}</div>
          <button onClick={() => handleNavigation('/profile')} className={styles.profileButton}>Profile</button>
        </div>

        <div className={`${styles.mainContent}`}>
          <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
            <button className={styles.toggleButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <ul className={styles.sidebarList}>
              <li>
                <button onClick={() => handleNavigation('/customers')}>
                  <FaUser className={styles.icon} /> {sidebarOpen && 'Customer List'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/cars')}>
                  <FaCar className={styles.icon} /> {sidebarOpen && 'Car List'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/transactions')}>
                  <FaMoneyCheckAlt className={styles.icon} /> {sidebarOpen && 'Transaction List'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/leases')}>
                  <FaFileContract className={styles.icon} /> {sidebarOpen && 'Lease List'}
                </button>
              </li>
            </ul>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </aside>
          <main className={styles.content}>
            <h1 className={styles.heading1}>Welcome to the CRM Dashboard</h1>
            <section className={styles.info}>
              <h2 className={styles.heading2}>Additional Information</h2>
              <p>Find other important details and updates here.</p>
            </section>
            <section className={styles.analytics}>
              <h2 className={styles.heading2}>Analytics</h2>
              <p>Here you can view various analytics and insights related to your CRM.</p>
              <div className={styles.fakeGraph}></div>
              <div className={styles.fakeTable}></div>
            </section>
          </main>
          {modalOpen && (
            <ModalAddCompany 
              isOpen={modalOpen} 
              onClose={closeModal}
              onAdd={handleAddCompany} // Pass the onAdd function
            />
          )}
        </div>
      </div>
    </div>
  );
}
