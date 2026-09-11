import React from 'react';
import { useAppSelector } from '../../../app/hooks';
import styles from './kyc.layout.module.css';

interface KycLayoutProps {
  children: React.ReactNode;
}

export const KycLayout: React.FC<KycLayoutProps> = ({ children }) => {
  const currentStep = useAppSelector((state) => state.kyc.currentStep);

  const getProgress = () => {
    switch (currentStep) {
      case 'DOCUMENT_UPLOAD': return '15%';
      case 'DOCUMENT_SUCCESS': return '30%';
      case 'DEVICE_SELECTION': return '45%';
      case 'LIVE_SELFIE': return '60%';
      case 'LIVENESS_CHALLENGE': return '75%';
      case 'REVIEW_VERIFICATION': return '90%';
      case 'SUCCESS': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className={styles.layoutContainer}>
      
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