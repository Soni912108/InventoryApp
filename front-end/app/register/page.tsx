"use client"; // Add this line to indicate this is a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation instead of next/router
import Link from 'next/link';
import styles from '../../styles/Register.module.css'; // Import the styles
import Spinner from '../../components/Spinner'; // Import the spinner component

// Define the type for the error state
interface ErrorState {
  username?: string[];
  email?: string[];
  password1?: string[];
  password2?: string[];
  general?: string[];
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<ErrorState>({}); // Use the ErrorState interface
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== password2) {
      setError({ password2: ['Passwords do not match'] });
      return;
    }

    try {
      setLoading(true); // Show the spinner
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username,email, password1: password, password2 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data.errors || { general: ['Registration failed'] }));
      }
      
      localStorage.setItem('token', data.access);
      localStorage.setItem('username', data.username);
      
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(JSON.parse(errorMessage));
    }
  };

  return (
    <div className={styles.container}>
      <title>Register</title>
      <h1 className={styles.header}>Register Page</h1>
      {error.general && <p className={styles.error}>{error.general[0]}</p>}
      <div className={styles.inputContainer}>
        <label htmlFor="id_username" className={styles.label}>Username:</label>
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          id="id_username"
          className={styles.input}
          placeholder="Username"
        />
        {error.username && <p className={styles.error}>{error.username[0]}</p>}
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="id_email" className={styles.label}>Email:</label>
        <input
          type="text"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="id_email"
          className={styles.input}
          placeholder="email"
        />
        {error.email && <p className={styles.error}>{error.email[0]}</p>}
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="id_password1" className={styles.label}>Password:</label>
        <input
          type="password"
          name="password1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="id_password1"
          className={styles.input}
          placeholder="Password"
        />
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="id_password2" className={styles.label}>Confirm Password:</label>
        <input
          type="password"
          name="password2"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          id="id_password2"
          className={styles.input}
          placeholder="Confirm Password"
        />
        {error.password2 && <p className={styles.error}>{error.password2.join(', ')}</p>}
      </div>
      {loading && <Spinner />} {/* Show the spinner when loading */}
      <button onClick={handleRegister} className={styles.button}>Register</button>
      <h4>
        <Link href="/login" className={styles.link}>Already have an account? Login</Link>
      </h4>
    </div>
  );
}