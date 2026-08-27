import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>MERGE</Link>
        <nav className={styles.navLinks}>
          <Link to="/features" className={styles.navLink}>Features</Link>
          <Link to="/safety" className={styles.navLink}>Safety</Link>
        </nav>
        <Link to="/login" className={styles.loginBtn}>Login</Link>
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};