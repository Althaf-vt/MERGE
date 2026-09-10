import { Link } from 'react-router-dom';
import styles from './profile-live.module.css';

export const ProfileLivePage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.glowBackground}></div>
      
      <div className={styles.content}>
        <div className={styles.diamondGraphic}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="4" width="65" height="65" rx="20" transform="rotate(45 50 4)" fill="#8B5CF6"/>
            <circle cx="50" cy="50" r="24" fill="#6D28D9"/>
            <circle cx="50" cy="50" r="4" fill="white"/>
          </svg>
        </div>

        <h1 className={styles.title}>Your Profile is Live.</h1>
        <p className={styles.subtitle}>
          Two Souls, One Journey. Your profile has been securely saved to the MERGE network.
        </p>

        <Link to="/" className={styles.homeButton}>
          Home
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>

        <div className={styles.secureBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          SECURED & VERIFIED
        </div>
      </div>

      <footer className={styles.footer}>
        © 2024 MERGE. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};