// profile page to show users infos , customizations and more

"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner'; // Import the spinner component
import styles from '../../styles/Profile.module.css'; // Import the CSS module

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const token = localStorage.getItem('token');

  // Fetch user data
  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/accounts/api/get_user_info/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Error fetching user info');
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:8000/accounts/api/change_password/', 
        { old_password: oldPassword ,
        new_password: newPassword },

        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Error changing password');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className={styles.profileContainer}>
      {loading && <Spinner />}
      {user && (
        <div className={styles.profileInfo}>
          <h2>Welcome, {user.first_name} {user.last_name}!</h2>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button onClick={() => setShowModal(true)} className={styles.changePasswordButton}>Change Password</button>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Change Password</h3>
            <label>
              Old Password:
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </label>
            <label>
              New Password:
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <label>
              Confirm Password:
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            <button onClick={handlePasswordChange} className={styles.modalButton}>Submit</button>
            <button onClick={() => setShowModal(false)} className={styles.modalButton}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
