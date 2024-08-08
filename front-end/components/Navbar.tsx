import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from '../styles/Navbar.module.css'; // Import the styles

interface NavbarProps {
  handleNavigation: (path: string) => void; // Define the type of the prop
}

export default function Navbar({ handleNavigation }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = usePathname();
  const isCurrentPage = (path: string) => currentPath === path;
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const username = localStorage.getItem('username')
  return (
    <div className={styles.navbar}>
      <div className={styles.userGreeting}>Hello, {username}</div>
      <div className={styles.buttonGroup}>
        
        {!isCurrentPage('/cars') && (
          <button onClick={() => handleNavigation('/cars')} className={styles.profileButton}>
            Cars
          </button>
        )}
        {!isCurrentPage('/transactions') && (
          <button onClick={() => handleNavigation('/transactions')} className={styles.profileButton}>
            Transactions
          </button>
        )}
        {!isCurrentPage('/leases') && (
          <button onClick={() => handleNavigation('/leases')} className={styles.profileButton}>
            Leases
          </button>
        )}
        {!isCurrentPage('/customers') && (
          <button onClick={() => handleNavigation('/customers')} className={styles.profileButton}>
            Customers
          </button>
        )}
        <div className={styles.moreMenuContainer}>
          <button onClick={toggleMenu} className={styles.moreButton}>
            More
          </button>
          {menuOpen && (
            <div className={styles.moreMenu}>
              {!isCurrentPage('/dashboard') && (
                <button onClick={() => handleNavigation('/dashboard')} className={styles.profileButton}>
                  Dashboard
                </button>
              )}
              {!isCurrentPage('/profile') && (
                <button onClick={() => handleNavigation('/profile')} className={styles.profileButton}>
                  Profile
                </button>
              )}
              <button onClick={() => handleNavigation('/login')} className={`${styles.profileButton} ${styles.logoutButton}`}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
