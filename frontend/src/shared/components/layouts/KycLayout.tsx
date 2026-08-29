import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import styles from './KycLayout.module.css';

interface KycLayoutProps {
  children: React.ReactNode;
}

export const KycLayout: React.FC<KycLayoutProps> = ({ children }) => {
  const currentStep = useAppSelector((state) => state.kyc.currentStep);

  // Calculate progress based on the current step
  const getProgress = () => {
    switch (currentStep) {
      case 'DOCUMENT_UPLOAD': return '33%';
      case 'LIVENESS_CHECK': return '66%';
      case 'SUCCESS': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <header className={styles.topBar}>
        <div className={styles.brand}>MERGE</div>
        <Link to="/support" className={styles.helpLink}>Need help?</Link>
      </header>
      
      {/* Dynamic Progress Indicator */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: getProgress() }}></div>
      </div>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};