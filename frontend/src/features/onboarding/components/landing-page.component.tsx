import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../app/hooks';
import type { RootState } from '../../../app/store';
import Topography from '../../../shared/components/ui/topography/topography.component';
import styles from './landing-page.module.css';

// Import the refresh mutation and action to update Redux dynamically
import { useRefreshMutation } from '../../auth/api/auth.api';
import { setCredentials } from '../../auth/slices/auth.slice';

export const LandingComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // 1. Initialize the refresh mutation
  const [refresh] = useRefreshMutation();

  // 2. Silent background sync: Fetch the latest user state every time they view the homepage
  useEffect(() => {
    if (isAuthenticated) {
        refresh().unwrap().then((data) => {
            dispatch(setCredentials({ 
                accessToken: data.accessToken, 
                user: data.user 
            }));
        }).catch((err) => {
            console.error("Silent sync failed:", err);
        });
    }
  }, [isAuthenticated, refresh, dispatch]);

  // Calculate onboarding progress using strict equality and data checks
  const { progress, nextRoute, stepName } = useMemo(() => {
    if (!isAuthenticated || !user) return { progress: 0, nextRoute: '/register', stepName: '' };
    
    // 1. MASTER COMPLETION CHECK
    const isFullyOnboarded = user.onboardingCompleted || user.onboardingStep === 14;
    if (isFullyOnboarded) {
        return { progress: 100, nextRoute: '/profile-live', stepName: 'Platform Ready' };
    }

    // 2. Check KYC (Phases 3-8)
    if (!user.kycCompleted) {
        const kyc = user.kycVerification;
        if (kyc?.verificationSubmitted && kyc?.reviewDecision !== 'APPROVED') {
            return { progress: 40, nextRoute: '/onboarding/kyc', stepName: 'Awaiting Admin Review' };
        }
        if (kyc?.selfieVerificationStatus === 'APPROVED') {
            return { progress: 25, nextRoute: '/onboarding/kyc', stepName: 'Complete Liveness & Review' };
        }
        if (kyc?.documentType) {
            return { progress: 15, nextRoute: '/onboarding/kyc', stepName: 'Live Selfie Capture' };
        }
        return { progress: 10, nextRoute: '/onboarding/kyc', stepName: 'Identity Verification' };
    }

    // 3. Check Profile Onboarding (Phases 9-12)
    const step = user.onboardingStep || 0;
    const prefs = user.preference || (user as any).preferences;
    const prof = user.profile;
    
    // Did they finish Preferences? (Step is exactly 5, OR data exists)
    const hasCompletedPreferences = !!(prefs?.relationshipGoals || prefs?.relationShipGoals);
                     
    if (step === 5 || hasCompletedPreferences) {
        return { progress: 90, nextRoute: '/onboarding/bio', stepName: 'Bio Generation' };
    }

    // Did they finish Lifestyle? (Step is exactly 4, OR data exists)
    const hasCompletedLifestyle = !!prof?.occupation;
    
    if (step === 4 || hasCompletedLifestyle) {
        return { progress: 80, nextRoute: '/onboarding/preferences', stepName: 'Partner Preferences' };
    }

    // Did they finish Persona? (Step is exactly 3, OR data exists)
    const hasCompletedPersona = !!prof?.displayName;
    
    if (step === 3 || hasCompletedPersona) {
        return { progress: 65, nextRoute: '/onboarding/lifestyle', stepName: 'Lifestyle Details' };
    }

    // Catch-all: They just finished KYC (step === 8), haven't saved Persona yet
    return { progress: 50, nextRoute: '/onboarding/profile', stepName: 'Build Persona' };
  }, [user, isAuthenticated]);

  const isPartiallyOnboarded = isAuthenticated && progress < 100;

  return (
    <div className={styles.landingContainer}>
      {/* Background Canvas Layer */}
      <div className={styles.topographyBackground}>
        <Topography
          lightMode={true}
          lowColor="#6d28d9"
          midColor="#ec4899"
          highColor="#06b6d4"
          speed={0.35}
          morphAmount={3}
          morphSpeed={0.05}
          bands={2}
          thickness={0.01}
          scale={2}
          pixelSize={1}
          glow={0.16}
          colorMode="elevation"
          contrast={3}
          brightness={1}
          fillBands={false}
          opacity={1}
          grain={true}
          grainIntensity={0.018}
          mouseInteraction={true}
          mouseRadius={0.3}
          mouseStrength={0.4}
        />
      </div>

      {/* Foreground Content */}
      <div className={styles.pageContent}>
        
        {/* Conditional Resume Widget for Authenticated Incomplete Users */}
        {isPartiallyOnboarded && (
          <div className={styles.resumeWidget}>
            <div className={styles.resumeContent}>
              <div className={styles.resumeText}>
                <h3 className={styles.resumeTitle}>Your Profile is {progress}% Complete</h3>
                <p className={styles.resumeDesc}>Next step: {stepName}. Complete your profile to access matchmaking and community features.</p>
              </div>
              <div className={styles.resumeAction}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                </div>
                <button className={styles.resumeBtn} onClick={() => navigate(nextRoute)}>
                  Resume Journey
                </button>
              </div>
            </div>
          </div>
        )}

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Where Hearts Meet and <span className={styles.highlight}>Merge.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Bound by Gravity, United for Eternity. A secure, inclusive space designed for everyone to find their lifelong partner.
          </p>
          {!isAuthenticated && (
              <button className={styles.primaryBtn} onClick={() => navigate('/register')}>
                Find Your Match
              </button>
          )}
        </section>

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

        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>A Space Designed for You</h2>
          <p className={styles.sectionSubtitle}>Trusted, inclusive, and built on privacy.</p>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.iconBox}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Love for Everyone</h3>
              <p className={styles.featureDesc}>Comprehensive LGBTQIA+ inclusive matching algorithms that understand nuance.</p>
            </div>

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

        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2 className={styles.sectionTitle}>From Meeting to Eternity.</h2>
            <p className={styles.sectionSubtitle} style={{ marginBottom: '2rem' }}>Love That Naturally Merges.</p>
            {!isAuthenticated ? (
                <button className={styles.primaryBtn} onClick={() => navigate('/register')}>
                  Create Your Free Profile
                </button>
            ) : isPartiallyOnboarded ? (
                <button className={styles.primaryBtn} onClick={() => navigate(nextRoute)}>
                  Complete Your Profile
                </button>
            ) : (
                <button className={styles.primaryBtn} onClick={() => navigate('/profile-live')}>
                  Enter Platform
                </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};