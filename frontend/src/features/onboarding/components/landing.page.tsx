import styles from './landing.module.css';

export const LandingPage = () => {
  return (
    <div className={styles.landingContainer}>
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Where Hearts Meet and <span className={styles.highlight}>Merge.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Bound by Gravity, United for Eternity. A secure, inclusive space designed for everyone to find their lifelong partner.
        </p>
        <button className={styles.primaryBtn}>Find Your Match</button>
      </section>

      {/* Journey Section */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>The MERGE Journey</h2>
        <p className={styles.sectionSubtitle}>Two Souls, One Journey.</p>
        
        <div className={styles.journeySteps}>
          {[
            { letter: 'M', title: 'Meet', desc: 'Discover authentic connections.' },
            { letter: 'E', title: 'Engage', desc: 'Commit to a shared future.' },
            { letter: 'R', title: 'Romance', desc: 'Watch emotional bonds grow.' },
            { letter: 'G', title: 'Gravity', desc: 'The natural pull of two hearts.' },
            { letter: 'E', title: 'Eternity', desc: 'A bond that lasts forever.' }
          ].map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.stepIcon}>{step.letter}</div>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>A Space Designed for You</h2>
        <p className={styles.sectionSubtitle}>Trusted, inclusive, and built on privacy.</p>
        
        <div className={styles.featuresGrid}>
          {/* Card 1 */}
          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Love for Everyone</h3>
            <p className={styles.featureDesc}>Comprehensive LGBTQIA+ inclusive matching algorithms that understand nuance.</p>
          </div>
          
          {/* Card 2 */}
          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>The Catfish Loop</h3>
            <p className={styles.featureDesc}>Advanced AI liveness checks combined with Government ID verification for a secure community.</p>
          </div>

          {/* Card 3 */}
          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Privacy First</h3>
            <p className={styles.featureDesc}>Blurred photo vaults and intuitive Outness Spectrum sliders put you in control of your visibility.</p>
          </div>

          {/* Wide Card */}
          <div className={`${styles.featureCard} ${styles.featureCardWide}`}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Scene Partner</h3>
              <p className={styles.featureDesc}>Your personal AI dating coach. Optimize your profile, practice conversations, and build confidence before your first meet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.sectionTitle}>From Meeting to Eternity.</h2>
        <p className={styles.sectionSubtitle}>Love That Naturally Merges.</p>
        <button className={styles.primaryBtn}>Create Your Free Profile</button>
      </section>
      
    </div>
  );
};