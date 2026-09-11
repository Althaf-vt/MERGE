import React from 'react';
import styles from './auth.layout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};