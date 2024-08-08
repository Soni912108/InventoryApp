"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/Login.module.css'; // Import the styles
import Spinner from '../../components/Spinner'; // Import the spinner component

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true); // Show the spinner
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access);
      localStorage.setItem('username', data.username);

      router.push('/dashboard');
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false); // Hide the spinner
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 30000); // Set timeout for 30 seconds

      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={styles.container}>
      <title>Login</title>
      <h1 className={styles.header}>Login Page</h1>
      
      {error && <p className={styles.error}>{error}</p>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className={styles.input}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className={styles.input}
      />
      {loading && <Spinner />} {/* Show the spinner when loading */}
      <button onClick={handleLogin} className={styles.button}>Login</button>
      <h4>
        <Link href="/register" className={styles.link}>Don't have an account? Register</Link>
      </h4>
    </div>
  );
}
