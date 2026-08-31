import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import styles from './KycDocumentUpload.module.css';

export const KycSuccess = () => {
  const navigate = useNavigate();
  
  // Retrieve the democraphic data we saved to Redux during the PKI upload
  const extractedData = useAppSelector((state) => state.kyc.extractedData);

  const handleContinue = () => {
    // Navigates the user to Milestone 3: Profile Setup
    navigate('/onboarding/profile');
  };

  // Fallback in case the component renders before data is available
  if (!extractedData) {
    return <div className={styles.wrapper}>Loading verified data...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Identity Verified</h2>
      <p className={styles.subtitle}>
        Your cryptographic signature is valid. We have successfully extracted your demographic data.
      </p>
      
      <div className={styles.dataCard}>
        <p><strong>Legal Name:</strong> {extractedData.legalName}</p>
        <p>
          <strong>Date of Birth:</strong>{' '}
          {new Date(extractedData.dateOfBirth).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <button onClick={handleContinue} className={styles.primaryBtn}>
        Continue to Profile Setup
      </button>
    </div>
  );
};