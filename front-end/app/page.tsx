import { FaRegSmile, FaChartLine, FaUsers, FaDatabase } from 'react-icons/fa';
import styles from '../styles/Home.module.css';



export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>CRM App</div>
        </div>
        <nav className={styles.nav}>
          <a href="#" className={styles.link}>Home</a>
          <a href="login" className={styles.link}>Login</a>
          <a href="#" className={styles.link}>Features</a>
          <a href="#" className={styles.link}>Contact</a>
        </nav>
      </header>
      <main className={styles.main}>
        <section className={styles.hero}>
          <h2>Your CRM Solution</h2>
          <p>Streamline your business processes with our all-in-one CRM app.</p>
          <a href="register" className={styles.heroButton}>Get Started</a>
        </section>
        <section className={styles.benefits}>
          <h3>Why Choose CRM App?</h3>
          <ul>
            <li><FaRegSmile size={24} /> Streamlined workflows for better organization.</li>
            <li><FaDatabase size={24} /> Enhanced customer data management for personalized interactions.</li>
            <li><FaUsers size={24} /> Improved communication and collaboration for stronger relationships.</li>
            <li><FaChartLine size={24} /> Detailed analytics to track performance and make data-driven decisions.</li>
          </ul>
        </section>
      </main>
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} CRM App. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
